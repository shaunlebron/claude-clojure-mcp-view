(ns test
  (:require ["claude-code/testing" :refer [expect test]]
            [clojure.string :as str]))

(def eval-tool "mcp__clojure-mcp__clojure_eval")
(def code "(let [x 1]\n  (+ x 2))")
(def value "({:a 1}\n {:b 2})")
(def footer "*======== user | clj ========*")
(def output (str "printed\n=> " value "\n" footer))

;;——————————————————————————————————————————————————————————————————————————————
;; Helpers
;;——————————————————————————————————————————————————————————————————————————————

(defn engine-draws [on text]
  (on "ui.render" (fn [] {:type "Text" :props {} :children [text]})))

(defn settings-are [on settings]
  (on "state.get" {:plugin "clojure-mcp-view" :key "settings"}
      (fn [] {:value {:value settings :version 1}})))

(defn mount-row
  ([$ expanded?] (mount-row $ expanded? eval-tool code))
  ([$ expanded? tool source]
   (.mount (.-ui $)
           {:plugin "clojure-mcp-view" :surface "terminal" :component "ToolUse"
            :requestId "e1"
            :props {:tool tool :tool_use_id "e1" :input {:code source}
                    :isExpanded expanded? :isRunning false :isErrored false
                    :isInterrupted false}})))

(defn mount-result
  ([$ expanded?] (mount-result $ expanded? output))
  ([$ expanded? out]
   (.mount (.-ui $)
           {:plugin "clojure-mcp-view" :surface "terminal" :component "ToolResult"
            :requestId "e1"
            :props {:tool eval-tool :tool_use_id "e1" :output out
                    :isExpanded expanded? :isErrored false}})))

(defn ^:async code-sources [ui]
  (mapv #(:source (:props %)) (js-await (.findAll ui {:type "Code"}))))

(defn ^:async texts [ui]
  (mapv :text (js-await (.findAll ui {:type "Text"}))))

(defn ^:async found? [ui query]
  (some? (js-await (.find ui query))))

(defn is [actual expected]
  (.toEqual (expect actual) expected))

;;——————————————————————————————————————————————————————————————————————————————
;; Drawing
;;——————————————————————————————————————————————————————————————————————————————

(test "by default: request and response, both highlighted"
      ^:async
      (fn [$ on]
        (engine-draws on "engine")
        (let [row (js-await (mount-row $ true))]
          (is (js-await (found? row {:type "Text" :text "engine"})) true)
          (is (js-await (code-sources row)) [";; Request:" code])
          (js-await (.unmount row)))
        (let [result (js-await (mount-result $ true))]
          (is (js-await (code-sources result)) [";; Response:" value])
          (js-await (.unmount result)))))

(test "request: code under the row, expanded only, highlighted"
      ^:async
      (fn [$ on]
        (engine-draws on "engine row")
        (settings-are on {:request true :response false :highlight true})
        (let [ui (js-await (mount-row $ true))]
          (is (js-await (found? ui {:type "Text" :text "engine row"})) true)
          (is (:language (:props (js-await (.find ui {:type "Code"})))) "clojure")
          (is (js-await (code-sources ui)) [";; Request:" code])
          (js-await (.unmount ui)))
        (doseq [[expanded? tool] [[false eval-tool] [true "Bash"]]]
          (let [untouched (js-await (mount-row $ expanded? tool code))]
            (is (js-await (code-sources untouched)) [])
            (js-await (.unmount untouched))))))

(test "response: label, printed output and => column, without the ns line"
      ^:async
      (fn [$ on]
        (engine-draws on "engine result")
        (settings-are on {:request false :response true :highlight false})
        (doseq [out [output [{:type "text" :text output}]]]
          (let [ui (js-await (mount-result $ true out))]
            (doseq [text [";; Response:" "printed" "=> " value]]
              (is (js-await (found? ui {:type "Text" :text text})) true))
            (is (js-await (found? ui {:type "Text" :text footer})) false)
            (is (js-await (code-sources ui)) [])
            (js-await (.unmount ui))))
        (let [image (js-await (mount-result $ true [{:type "image" :data ""}]))]
          (is (js-await (found? image {:type "Text" :text "engine result"})) true)
          (js-await (.unmount image)))))

(test "response: each form of a multi-form eval gets its own group"
      ^:async
      (fn [$ on]
        (settings-are on {:request false :response true :highlight true})
        (let [forms (mapv #(str % "\n" footer)
                          ["first\n=> nil" "=> 3" "=> \"two values\""])]
          (doseq [out [(mapv (fn [text] {:type "text" :text text}) forms)
                       (str/join "" forms)]]
            (let [ui (js-await (mount-result $ true out))]
              (is (js-await (code-sources ui)) [";; Response:" "nil" "3" "\"two values\""])
              (is (count (js-await (.findAll ui {:type "Text" :text "=> "}))) 3)
              (is (js-await (found? ui {:type "Text" :text "first"})) true)
              (js-await (.unmount ui)))))))

;;——————————————————————————————————————————————————————————————————————————————
;; Folding
;;——————————————————————————————————————————————————————————————————————————————

(test "fold: a long section folds; a click unfolds and refolds it"
      ^:async
      (fn [$ on]
        (settings-are on {:request true :response true :highlight false :fold 3})
        (let [long-value (str/join "\n" ["(1" " 2" " 3" " 4" " 5)"])
              ui (js-await (mount-result $ true (str "=> " long-value "\n" footer)))
              expand {:type "Button" :text "… +2 lines (click to expand)"}
              shown? ^:async (fn [text] (contains? (set (js-await (texts ui))) text))]
          (is (js-await (shown? "(1\n 2\n 3")) true)
          (is (js-await (found? ui expand)) true)

          (js-await (.press ui {:key "e1:response"}))
          (is (js-await (shown? long-value)) true)
          (is (js-await (found? ui {:type "Button" :text "(click to fold)"})) true)

          (js-await (.press ui {:key "e1:response"}))
          (is (js-await (found? ui expand)) true)
          (js-await (.unmount ui)))))

(test "fold: a section within the limit draws no button"
      ^:async
      (fn [$ on]
        (engine-draws on "engine row")
        (settings-are on {:request true :response true :highlight false :fold 10})
        (let [ui (js-await (mount-row $ true))]
          (is (js-await (found? ui {:type "Button"})) false)
          (js-await (.unmount ui)))))

(test "fold off: a long section is drawn whole, with no button"
      ^:async
      (fn [$ on]
        (engine-draws on "engine row")
        (settings-are on {:request true :response true :highlight false :fold false})
        (let [long-code (str/join "\n" (map #(str "(line " % ")") (range 30)))
              ui (js-await (mount-row $ true eval-tool long-code))]
          (is (js-await (found? ui {:type "Text" :text long-code})) true)
          (is (js-await (found? ui {:type "Button"})) false)
          (js-await (.unmount ui)))))

;;——————————————————————————————————————————————————————————————————————————————
;; The /clj-view command
;;——————————————————————————————————————————————————————————————————————————————

(defn ^:async start-session [$ on store]
  (on "command.register" (fn [] {:value {:command "clj-view"}}))
  (on "command.run" (fn [] {:text "engine"}))
  (on "store.get" (fn [_ e] {:value (get store (:key e))}))
  (on "store.set" (fn [_ e] (aset store (:key e) (:value e)) {:value js/undefined}))
  (on "session.start" (fn [_ e] {:cwd (:cwd e)}))
  (js-await (.start (.-session $) {:cwd "/" :surface "terminal" :isInteractive true}))
  ^:async
  (fn [args]
    (:text (js-await (.run (.-command $) {:command "clj-view" :args args})))))

(test "/clj-view shows, sets and saves the settings"
      ^:async
      (fn [$ on]
        (let [store {}
              run (js-await (start-session $ on store))]
          (is (js-await (run "")) "request on · response on · highlight on · fold 10")
          (is (js-await (run "highlight off"))
              "request on · response on · highlight off · fold 10")
          (is (js-await (run "fold off"))
              "request on · response on · highlight off · fold off")
          (is (js-await (run "fold 5"))
              "request on · response on · highlight off · fold 5")
          (is (:settings store) {:request true :response true :highlight false :fold 5})
          (doseq [bad ["request maybe" "fold 0" "fold lots" "colour on"]]
            (is (str/starts-with? (js-await (run bad)) "Usage:") true)))))

(test "saved settings are loaded when the session starts"
      ^:async
      (fn [$ on]
        (let [run (js-await (start-session $ on {:settings {:request false
                                                            :highlight false}}))]
          (is (js-await (run "")) "request off · response on · highlight off · fold 10"))))
