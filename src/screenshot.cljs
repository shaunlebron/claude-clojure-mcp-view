(ns screenshot
  (:require ["claude-code/testing" :refer [expect test]]
            [clojure.string :as str]))

;; Not a test: bin/screenshot.bb runs it to print what the plugin draws for one eval,
;; folded at 10 lines, and lays that out as screenshot.svg, plus a baseline without it.

(def eval-tool "mcp__clojure-mcp__clojure_eval")
(def fold-lines 10)

(def code
  (str/join "\n" ["(println \"rows for the fold check\")"
                  "(->> (range 30)"
                  "     (map (fn [i] {:i i :square (* i i) :label (str \"row-\" i)}))"
                  "     vec)"]))

(def output
  (str "rows for the fold check\n=> nil\n*======== user | clj ========*\n"
       "=> ["
       (str/join "\n "
                 (map #(str "{:i " % ", :square " (* % %) ", :label \"row-" % "\"}")
                      (range 30)))
       "]\n*======== user | clj ========*"))

;; Stands in for Claude Code's own row for the call, which the plugin draws under.
(def engine-row
  {:type "Box" :props {}
   :children [{:type "Text" :props {:color "green"} :children ["⏺ "]}
              {:type "Text" :props {:bold true}
               :children ["clojure-mcp - Evaluate Clojure Code (MCP)"]}
              {:type "Text" :props {}
               :children [(str "(code: "
                               (js/JSON.stringify code)
                               ")")]}]})

;; Stand-in for Claude Code 2.1.319's default expanded MCP result (HD / Ye):
;; plain text beside a dim result marker. Crop the image after the same row as the
;; mod's fold, with an editorial note: the default UI itself does not fold here.
(def engine-result
  {:type "Box" :props {:flexDirection "column"}
   :children [{:type "Box" :props {}
               :children [{:type "Text" :props {:dimColor true} :children ["  ⎿  "]}
                          {:type "Text" :props {}
                           ;; The baseline includes one namespace line the mod removes.
                           :children [(str/join "\n" (take (inc fold-lines) (str/split-lines output)))]}]}
              {:type "Box" :props {:paddingLeft 5 :marginY 1}
               :children [{:type "Text" :props {:dimColor true}
                           :children ["[Image cropped; remaining 22 rows continue below]"]}]}]})

(defn ^:async print-drawn [$ component props]
  (let [ui (js-await (.mount (.-ui $)
                             {:plugin "clojure-mcp-view" :surface "terminal"
                              :component component :requestId component
                              :props (merge {:tool eval-tool :tool_use_id "e1"
                                             :isExpanded true :isErrored false}
                                            props)}))]
    (js/console.log (str "DRAWN:" (js/JSON.stringify (js-await (.drawn ui)))))
    (js-await (.unmount ui))))

(test "screenshot: print the drawn request and response"
      ^:async
      (fn [$ on]
        (doseq [tree [engine-row engine-result]]
          (js/console.log (str "BEFORE:" (js/JSON.stringify tree))))
        (on "ui.render" (fn [] engine-row))
        (on "state.get" {:plugin "clojure-mcp-view" :key "settings"}
            (fn [] {:value {:value {:request true :response true :highlight true :fold fold-lines}
                            :version 1}}))
        (js-await (print-drawn $ "ToolUse" {:input {:code code} :isRunning false
                                            :isInterrupted false}))
        (js-await (print-drawn $ "ToolResult" {:output output}))
        (.toBe (expect true) true)))
