#!/usr/bin/env bb
;; Compiles the mod (main.cljs) and its tests (test.cljs) with squint, then bundles each
;; with esbuild, in the form Claude Code accepts:
;; - a mod imports only the plugin's own files, so the bundle carries the squint runtime
;;   it uses (esbuild drops the rest)
;; - its mod loader refuses `var` bindings for register and hooks; squint and esbuild
;;   both emit `var`
;; - `claude plugin test` runs only *.test.ts files, so each compiled test is written as
;;   one (plain JS is valid TS)

(require '[babashka.fs :as fs]
         '[babashka.process :refer [shell]]
         '[cheshire.core :as json]
         '[clojure.string :as str])

(def root (fs/parent (fs/absolutize *file*)))

;; Claude Code reads the plugin's version from plugin.json, so it follows package.json's,
;; which release.bb bumps.
(let [manifest (str (fs/path root ".claude-plugin/plugin.json"))
      read-json #(json/parse-string (slurp (str %)))
      version (get (read-json (fs/path root "package.json")) "version")
      style {:pretty {:indentation 2 :object-field-value-separator ": "}}]
  (spit manifest (str (json/generate-string (assoc (read-json manifest) "version" version)
                                            style)
                      "\n")))

;; squint writes .jsx beside the source when it uses #jsx, .mjs otherwise.
(defn compile! [src]
  (shell {:dir (str root) :out :string} "npx" "squint" "compile" (str src))
  (->> [".jsx" ".mjs"]
       (map #(fs/path (fs/parent src) (str (fs/strip-ext (fs/file-name src)) %)))
       (filter fs/exists?)
       first))

(defn bundle! [in out & opts]
  (apply shell {:dir (str root)} "npx" "esbuild" (str (fs/relativize root in))
         "--bundle" "--format=esm" "--platform=neutral" "--jsx=preserve"
         "--allow-overwrite" "--log-level=warning"
         (str "--outfile=" (fs/relativize root out)) opts))

;; Only the mod's own section of the bundle, after its `// main.jsx` marker; the squint
;; runtime above it is left as esbuild wrote it.
(defn mod-vars->const [js]
  (let [i (str/index-of js "// main.jsx\n")]
    (str (subs js 0 i) (str/replace (subs js i) #"(?m)^var " "const "))))

(defn comment-lines [text]
  (str/join "\n" (map #(str/trimr (str "// " %)) (str/split-lines (str/trim text)))))

(def bundle-notice
  (str "// Includes parts of squint-cljs's runtime "
       "(https://github.com/squint-cljs/squint),\n"
       "// Copyright © 2022 - 2026 Michiel Borkent, "
       "under the Eclipse Public License 1.0.\n"
       "//\n"
       "// Includes highlight.js (https://github.com/highlightjs/highlight.js), "
       "under this license:\n"
       "//\n"
       (comment-lines (slurp (str (fs/path root "node_modules/highlight.js/LICENSE"))))))

(let [main (compile! (fs/path root "main.cljs"))]
  (bundle! main main (str "--banner:js=" bundle-notice))
  (spit (str main) (mod-vars->const (slurp (str main)))))

(let [test (compile! (fs/path root "test.cljs"))]
  (bundle! test (fs/path root "main.test.ts") "--external:claude-code/testing")
  (fs/delete test))
