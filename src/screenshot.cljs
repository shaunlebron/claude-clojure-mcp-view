(ns screenshot
  (:require ["claude-code/testing" :refer [expect test]]
            [clojure.string :as str]))

;; Not a test: bin/screenshot.bb runs it to print what the plugin draws for one eval,
;; folded at 10 lines, and lays that out as screenshot.svg.

(def eval-tool "mcp__clojure-mcp__clojure_eval")

(def code
  (str/join "\n" ["(println \"rows for the fold check\")"
                  "(->> (range 30)"
                  "     (map (fn [i] {:i i :square (* i i) :label (str \"row-\" i)}))"
                  "     vec)"]))

(def output
  (str "rows for the fold check\n=> nil\n*======== user | clj ========*"
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
               :children ["clojure-mcp - clojure_eval (MCP)"]}
              {:type "Text" :props {}
               :children [(str "(code: "
                               (js/JSON.stringify code)
                               ")")]}]})

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
        (on "ui.render" (fn [] engine-row))
        (on "state.get" {:plugin "clojure-mcp-view" :key "settings"}
            (fn [] {:value {:value {:request true :response true :highlight true :fold 10}
                            :version 1}}))
        (js-await (print-drawn $ "ToolUse" {:input {:code code} :isRunning false
                                            :isInterrupted false}))
        (js-await (print-drawn $ "ToolResult" {:output output}))
        (.toBe (expect true) true)))
