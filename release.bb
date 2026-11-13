#!/usr/bin/env bb
;; Releases the plugin: `bb release.bb patch` (or minor, major).
;; - bumps package.json's version, builds (which copies it into plugin.json), tests and
;;   validates, dates CHANGELOG.md's Unreleased notes as that version, then commits these
;;   on the current branch
;; - commits the built plugin to the release branch, which .claude-plugin/marketplace.json
;;   installs from, and tags that commit vX.Y.Z, so a tag always names a built plugin
;; - pushes the branch, the release branch and the tag

(require '[babashka.fs :as fs]
         '[babashka.process :refer [shell]]
         '[cheshire.core :as json]
         '[clojure.string :as str])

(def root (str (fs/parent (fs/absolutize *file*))))
(def release-branch "release")
(def plugin-files [".claude-plugin/plugin.json" "hooks.json" "main.jsx" "types.d.ts"
                   "LICENSE" "CHANGELOG.md"])
(def changelog (str (fs/path root "CHANGELOG.md")))
(def unreleased "## Unreleased\n")

(defn git [& args] (apply shell {:dir root :out :string} "git" args))

(defn bumped [version part]
  (let [[major minor patch] (map parse-long (str/split version #"\."))]
    (case part
      "major" (str (inc major) ".0.0")
      "minor" (str major "." (inc minor) ".0")
      "patch" (str major "." minor "." (inc patch)))))

(defn bump-package! [part]
  (let [file (str (fs/path root "package.json"))
        package (json/parse-string (slurp file))
        version (bumped (get package "version") part)
        style {:pretty {:indentation 2 :object-field-value-separator ": "}}]
    (spit file (str (json/generate-string (assoc package "version" version) style) "\n"))
    version))

(defn unreleased-notes []
  (let [text (slurp changelog)
        start (+ (str/index-of text unreleased) (count unreleased))]
    (str/trim (subs text start (or (str/index-of text "\n## " start) (count text))))))

;; The notes under Unreleased become the version's, and a new, empty Unreleased goes above.
(defn date-changelog! [version]
  (spit changelog (str/replace-first (slurp changelog) unreleased
                                     (str unreleased "\n## " version " ("
                                          (java.time.LocalDate/now) ")\n"))))

(defn release-worktree! [dir]
  (shell {:dir root :continue true :err :string} "git" "fetch" "origin" release-branch)
  (if (zero? (:exit (shell {:dir root :continue true :out :string :err :string}
                           "git" "rev-parse" "--verify" (str "origin/" release-branch))))
    (git "worktree" "add" "-B" release-branch dir (str "origin/" release-branch))
    (git "worktree" "add" "--orphan" "-b" release-branch dir)))

(defn commit-release! [version]
  (let [dir (str (fs/create-temp-dir))
        tag (str "v" version)
        source (str/trim (:out (git "rev-parse" "--short" "HEAD")))]
    (try
      (release-worktree! dir)
      (shell {:dir dir} "git" "rm" "-rq" "--ignore-unmatch" ".")
      (doseq [f plugin-files]
        (fs/create-dirs (fs/parent (fs/path dir f)))
        (fs/copy (fs/path root f) (fs/path dir f) {:replace-existing true}))
      (shell {:dir dir} "git" "add" "-A")
      (shell {:dir dir} "git" "commit" "-qm"
             (str "Release " tag " (built from " source ")"))
      (shell {:dir dir} "git" "tag" tag)
      tag
      (finally
        (git "worktree" "remove" "--force" dir)))))

(let [[part] *command-line-args*
      branch (str/trim (:out (git "branch" "--show-current")))]
  (when-not (#{"major" "minor" "patch"} part)
    (throw (ex-info "Usage: bb release.bb major|minor|patch" {:arg part})))
  (when (seq (str/trim (:out (git "status" "--porcelain"))))
    (throw (ex-info "Commit or stash changes first: the release is built from HEAD" {})))
  (when (str/blank? (unreleased-notes))
    (throw (ex-info "Add this release's notes under ## Unreleased in CHANGELOG.md" {})))
  (let [version (bump-package! part)]
    (load-file (str (fs/path root "build.bb")))
    (shell {:dir root} "claude" "plugin" "test" ".")
    (shell {:dir root} "claude" "plugin" "validate" ".")
    (date-changelog! version)
    (git "commit" "-qm" (str "Version " version)
         "package.json" ".claude-plugin/plugin.json" "CHANGELOG.md")
    (let [tag (commit-release! version)]
      (shell {:dir root} "git" "push" "origin" branch release-branch tag)
      (println "Released" tag))))
