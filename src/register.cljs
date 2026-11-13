(ns register
  (:require [clojure.string :as str]))

(def eval-tool "mcp__clojure-mcp__clojure_eval")
(def ns-line #"\*=+ [^*\n]+ =+\*")
(def toggles ["request" "response" "highlight"])
(def defaults {:request true
               :response true
               :highlight true
               :fold 10})
(def usage (str "Usage: /clj-view [request|response|highlight] [on|off]\n"
                "       /clj-view fold [<lines>|off]"))

;;——————————————————————————————————————————————————————————————————————————————
;; Settings
;;——————————————————————————————————————————————————————————————————————————————

(defn describe [settings]
  (str (str/join " · " (map #(str % (if (get settings %) " on" " off")) toggles))
       " · fold " (or (:fold settings) "off")))

(defn parse-setting [option value]
  (cond
    (and (some #(= option %) toggles) (contains? #{"on" "off"} value))
    [option (= value "on")]

    (and (= option "fold") (= value "off"))
    ["fold" false]

    (and (= option "fold") (re-matches #"[1-9]\d*" (str value)))
    ["fold" (js/parseInt value)]))

(defn ^:async read-settings [$]
  (merge defaults (:value (js-await (.get (.-state $) {:plugin "clojure-mcp-view"
                                                       :key "settings"})))))

(defn ^:async write-settings [$ settings]
  (js-await (.set (.-state $) {:plugin "clojure-mcp-view" :key "settings"} settings)))

;;——————————————————————————————————————————————————————————————————————————————
;; Parsing clojure-mcp's output
;;——————————————————————————————————————————————————————————————————————————————

(defn output-text [output]
  (if (string? output)
    output
    (let [blocks (if (array? output) output (:content output))]
      (when (and (array? blocks) (every? #(= "text" (:type %)) blocks))
        (str/join "\n" (map :text blocks))))))

;; clojure-mcp ends each top-level form's output with a `*==== user | clj ====*` line,
;; which only names the namespace, so it's dropped.
(defn form-outputs [text]
  (remove str/blank? (.split text ns-line)))

;; clojure-mcp prints each value as `=> <pprint>`, indented as if the value began at
;; column 0, so a value is kept apart from its arrow to keep its lines aligned.
(defn response-items [text]
  (into []
        (mapcat (fn [body]
                  (let [[printed & values] (.split body #"(?m)^=> ")]
                    (concat (when-not (str/blank? printed)
                              [{:kind "printed" :text (str/trim printed)}])
                            (map (fn [v] {:kind "value" :text (str/trimr v)}) values)))))
        (form-outputs text)))

;;——————————————————————————————————————————————————————————————————————————————
;; Folding
;;——————————————————————————————————————————————————————————————————————————————

(defn fold-items [items limit]
  (loop [items items, room limit, shown [], hidden 0]
    (if (empty? items)
      {:shown shown :hidden hidden}
      (let [item (first items)
            lines (.split (:text item) "\n")
            n (count lines)]
        (cond
          (<= n room) (recur (rest items) (- room n) (conj shown item) hidden)
          (pos? room) (let [cut (assoc item :text (str/join "\n" (take room lines)))]
                        (recur (rest items) 0 (conj shown cut) (+ hidden (- n room))))
          :else       (recur (rest items) 0 shown (+ hidden n)))))))

(defn ^:async folded [$ section-id items fold]
  (let [{:keys [hidden] :as folded} (if fold
                                      (fold-items items fold)
                                      {:shown items :hidden 0})
        unfolded? (and (pos? hidden)
                       (:value (js-await (.get (.-state $) {:plugin "clojure-mcp-view"
                                                            :key "unfolded"
                                                            :id section-id}))))]
    (if unfolded?
      {:shown items :hidden hidden :unfolded? true}
      folded)))

(defn fold-toggle [{:keys [Button]} $ section-id {:keys [hidden unfolded?]}]
  (when (pos? hidden)
    (let [label (if unfolded?
                  "(click to fold)"
                  (str "… +" hidden (if (= 1 hidden) " line" " lines")
                       " (click to expand)"))]
      #jsx [Button {:key section-id :plain true :dimColor true
                    :onPress #(.set (.-state $) {:plugin "clojure-mcp-view"
                                                 :key "unfolded"
                                                 :id section-id}
                                    (not unfolded?))}
            label])))

;;——————————————————————————————————————————————————————————————————————————————
;; Drawing
;;——————————————————————————————————————————————————————————————————————————————

(defn clj-view [{:keys [Code Text]} highlight? source]
  (if highlight?
    #jsx [Code {:source source :language "clojure"}]
    #jsx [Text source]))

(defn item-view [{:keys [Box Text] :as ui} highlight? {:keys [kind text]}]
  (case kind
    "printed" #jsx [Text text]
    "value"   #jsx [Box {:flexDirection "row"}
                    [Text {:dimColor true} "=> "]
                    (clj-view ui highlight? text)]))

(defn ^:async on-row [$ e next]
  (let [{:keys [tool input isExpanded tool_use_id]} (:props e)
        code (:code input)]
    (if-not (and (= tool eval-tool) isExpanded (string? code))
      (next e)
      (let [{:keys [request highlight fold]} (js-await (read-settings $))]
        (if-not request
          (next e)
          (let [{:keys [Box] :as ui} (.resolve (.-ui $) e)
                section-id (str tool_use_id ":request")
                section (js-await (folded $ section-id [{:text code}] fold))
                row (js-await (next e))]
            #jsx [Box {:flexDirection "column"}
                  row
                  [Box {:flexDirection "column" :paddingLeft 2 :marginY 1}
                   (clj-view ui highlight ";; Request:")
                   (mapv #(clj-view ui highlight (:text %)) (:shown section))
                   (fold-toggle ui $ section-id section)]]))))))

(defn ^:async on-result [$ e next]
  (let [{:keys [tool output isExpanded isErrored tool_use_id]} (:props e)
        text (output-text output)]
    (if-not (and (= tool eval-tool) isExpanded (not isErrored) (some? text))
      (next e)
      (let [{:keys [response highlight fold]} (js-await (read-settings $))]
        (if-not response
          (next e)
          (let [{:keys [Box] :as ui} (.resolve (.-ui $) e)
                section-id (str tool_use_id ":response")
                section (js-await (folded $ section-id (response-items text) fold))]
            #jsx [Box {:flexDirection "column" :paddingLeft 2}
                  (clj-view ui highlight ";; Response:")
                  (mapv #(item-view ui highlight %) (:shown section))
                  (fold-toggle ui $ section-id section)]))))))

;;——————————————————————————————————————————————————————————————————————————————
;; Registration
;;——————————————————————————————————————————————————————————————————————————————

(defn ^:async on-session-start [$ e next]
  (js-await (.register (.-command $)
                       {:name "clj-view"
                        :description "Show or set how clojure-mcp evals draw in ctrl+o"
                        :argumentHint "[request|response|highlight on|off|fold <n>|off]"}))
  (let [saved (js-await (.get (.-store $) "settings"))]
    (js-await (write-settings $ (merge defaults saved))))
  (next e))

(defn ^:async on-command [$ e]
  (let [[option value] (remove str/blank? (str/split (str/trim (:args e)) #"\s+"))
        [k v :as setting] (parse-setting option value)]
    (cond
      (nil? option)  {:text (describe (js-await (read-settings $)))}
      (nil? setting) {:text usage}
      :else          (let [changed (assoc (js-await (read-settings $)) k v)]
                       (js-await (write-settings $ changed))
                       (js-await (.set (.-store $) "settings" changed))
                       {:text (describe changed)}))))

;; Draws only in the expanded view (ctrl+o), so toggling it also redraws earlier calls.
(defn register [on]
  (on "session.start" on-session-start)
  (on "command.run" {:command "clj-view"} on-command)
  (on "ui.render" {:component "ToolUse"} on-row)
  (on "ui.render" {:component "ToolResult"} on-result))
