#!/usr/bin/env bb
;; Draws one eval the way the plugin does, from what the built plugin returns: prints it to
;; the terminal and writes screenshot.svg in the My Clear Dark Ghostty theme.
;; - src/screenshot.cljs runs under `claude plugin test` and prints each drawn tree as JSON
;; - this lays the trees out in terminal cells (Box padding, margins, rows; Text; Button),
;;   in the colors the plugin names, from the theme's palette
;; - the engine's row for the call is a stand-in from src/screenshot.cljs

(load-file (str (babashka.fs/path (babashka.fs/parent (babashka.fs/absolutize *file*))
                                  "build.bb")))

(require '[babashka.fs :as fs]
         '[babashka.process :refer [shell]]
         '[cheshire.core :as json]
         '[clojure.string :as str]
         '[hiccup2.core :as h])

;; Shaun's Ghostty theme, "My Clear Dark" (dark mode): its background, foreground and 16
;; palette colors, which the plugin's ansi256(0-15) colors name. In a real terminal they
;; come from each person's own theme.
(def theme
  {:background "#212734"
   :foreground "#e6e6e6"
   :palette ["#35424c" "#b45648" "#6caa71" "#c4ac62"
             "#6d96b4" "#bd7bcd" "#7ccbcd" "#dee5eb"
             "#465c6d" "#df6c5a" "#79be7e" "#e5c872"
             "#67b5ed" "#d389e5" "#84dde0" "#e5eff5"]})

(def color-names
  {"black" 0 "red" 1 "green" 2 "yellow" 3 "blue" 4 "magenta" 5 "cyan" 6 "white" 7
   "gray" 8 "blackBright" 8 "redBright" 9 "greenBright" 10 "yellowBright" 11
   "blueBright" 12 "magentaBright" 13 "cyanBright" 14 "whiteBright" 15})

(defn palette [i] (get (:palette theme) i))

(defn palette-color [color]
  (palette (if-let [[_ i] (re-matches #"ansi256\((\d+)\)" color)]
             (parse-long i)
             (color-names color))))

;;——————————————————————————————————————————————————————————————————————————————
;; Drawn trees, from the plugin
;;——————————————————————————————————————————————————————————————————————————————

(defn drawn-trees []
  (let [tmp (fs/create-temp-dir)
        compiled (compile! (fs/path root "src/screenshot.cljs"))]
    (fs/copy-tree dist tmp)
    (fs/delete (fs/path tmp "main.test.ts"))
    (bundle! compiled (fs/path tmp "screenshot.test.ts") "--external:claude-code/testing")
    (fs/delete compiled)
    (let [out (:out (shell {:out :string :err :out :continue true}
                           "claude" "plugin" "test" (str tmp)))]
      (fs/delete-tree tmp)
      (or (seq (keep #(some-> (re-find #"DRAWN:(.*)" %) second json/parse-string)
                     (str/split-lines out)))
          (throw (ex-info "src/screenshot.cljs printed no drawn trees" {:output out}))))))

;;——————————————————————————————————————————————————————————————————————————————
;; Laying out in terminal cells
;;——————————————————————————————————————————————————————————————————————————————

;; A drawing is a vector of lines; a line is a vector of spans {:text :color :dim :bold}.

(defn spans->lines [spans]
  (reduce (fn [lines {:keys [text] :as span}]
            (let [[first-part & more] (str/split text #"\n" -1)
                  lines (update lines (dec (count lines))
                                conj (assoc span :text first-part))]
              (into lines (map #(vector (assoc span :text %)) more))))
          [[]]
          spans))

(defn width [line] (reduce + (map #(count (:text %)) line)))

;; A modest window: the call's code wraps beside its row, and the request fits unwrapped.
(def terminal-columns 80)

;; Row widths for text wrapped as Claude Code's Ink wraps a Text: wrap-ansi with
;; {trim: false, hard: true}.
;; - breaks at spaces, each space staying at the end of its row
;; - breaks a word only when it is wider than a row, starting it on a new row if that
;;   saves a break
(defn wrap-widths [text columns]
  (let [grow (fn [rows n] (update rows (dec (count rows)) + n))]
    (reduce
     (fn [rows [i word]]
       (let [n (count word)
             rows (if (and (pos? i) (>= (peek rows) columns)) (conj rows 0) rows)
             rows (if (pos? i) (grow rows 1) rows)
             used (peek rows)]
         (cond
           (> n columns)
           (loop [rows (if (< (quot (dec n) columns)
                              (inc (quot (- n (- columns used) 1) columns)))
                         (conj rows 0)
                         rows)
                  n n]
             (let [room (- columns (peek rows))]
               (if (<= n room)
                 (grow rows n)
                 (recur (conj (grow rows room) 0) (- n room)))))

           (and (pos? used) (pos? n) (> (+ used n) columns)) (conj rows n)
           :else (grow rows n))))
     [0]
     (map-indexed vector (str/split text #" " -1)))))

;; Splits styled spans after n characters: [the first n, the rest].
(defn take-chars [spans n]
  (loop [spans spans, taken [], n n]
    (if-let [{:keys [text] :as span} (when (pos? n) (first spans))]
      (let [k (min n (count text))]
        (recur (if (< k (count text))
                 (cons (assoc span :text (subs text k)) (rest spans))
                 (rest spans))
               (conj taken (assoc span :text (subs text 0 k)))
               (- n k)))
      [taken spans])))

;; Wraps one line of styled spans into rows at most `columns` wide, as Ink does.
(defn wrap-line [line columns]
  (let [spans (filter (comp seq :text) line)]
    (first
     (reduce (fn [[rows spans] n]
               (let [[row spans] (take-chars spans n)]
                 [(conj rows row) spans]))
             [[] spans]
             (wrap-widths (apply str (map :text spans)) columns)))))

(defn pad-right [line w] (conj line {:text (apply str (repeat (- w (width line)) " "))}))

(defn style [props inherited]
  (cond-> inherited
    (get props "color")    (assoc :color (palette-color (get props "color")))
    (get props "dimColor") (assoc :dim true)
    (get props "bold")     (assoc :bold true)))

(defn text-spans [children st]
  (mapcat (fn [c]
            (if (string? c)
              [(assoc st :text c)]
              (text-spans (get c "children") (style (get c "props") st))))
          children))

(defn side-by-side [drawings]
  (let [height (apply max 1 (map count drawings))
        widths (map #(apply max 0 (map width %)) drawings)]
    (vec (for [i (range height)]
           (vec (mapcat (fn [d w] (pad-right (get d i []) w)) drawings widths))))))

(declare layout)

;; A row's children, left to right, each in the columns the ones before it leave, so a
;; long Text wraps in its own column.
(defn layout-row [kids st columns]
  (side-by-side
   (first (reduce (fn [[drawings left] kid]
                    (let [d (layout kid st left)]
                      [(conj drawings d) (- left (apply max 0 (map width d)))]))
                  [[] columns]
                  kids))))

(defn layout-text [spans columns]
  (vec (mapcat #(wrap-line % columns) (spans->lines spans))))

(defn layout [node st columns]
  (let [{:strs [type props children]} node
        st (style props st)]
    (case type
      "Text"            (layout-text (text-spans children st) columns)
      "Button"          (layout-text (text-spans [(get props "label")] st) columns)
      "Box"             (let [kids (remove nil? (flatten children))
                              inner (- columns (get props "paddingLeft" 0))
                              body (if (= "column" (get props "flexDirection"))
                                     (vec (mapcat #(layout % st inner) kids))
                                     (layout-row kids st inner))
                              pad (get props "paddingLeft" 0)
                              margin (vec (repeat (get props "marginY" 0) []))]
                          (-> margin
                              (into (map #(into [{:text (apply str (repeat pad " "))}] %)
                                         body))
                              (into margin))))))

;;——————————————————————————————————————————————————————————————————————————————
;; Output: ANSI and SVG
;;——————————————————————————————————————————————————————————————————————————————

(defn hex->rgb [hex]
  (map #(Integer/parseInt (subs hex % (+ % 2)) 16) [1 3 5]))

;; Dim text is faded toward the background, as a terminal shows it.
(defn shown-rgb [{:keys [color dim]}]
  (let [rgb (hex->rgb (or color (:foreground theme)))]
    (if dim
      (map #(Math/round (+ (* 0.55 %1) (* 0.45 %2))) rgb (hex->rgb (:background theme)))
      rgb)))

(defn ansi [lines]
  (str/join "\n"
            (for [line lines]
              (apply str (for [{:keys [text bold] :as span} line]
                           (str (apply format "\u001b[38;2;%d;%d;%dm" (shown-rgb span))
                                (when bold "\u001b[1m")
                                text "\u001b[0m"))))))


(defn rgb->hex [rgb] (apply format "#%02x%02x%02x" rgb))

;; The viewer draws the text, in the first of these fonts it has; none has ligatures.
(def font-family "'SF Mono', Menlo, Consolas, 'DejaVu Sans Mono', monospace")
(def font-size 16)
(def cell-width (* 0.6 font-size))
(def line-height (* 1.35 font-size))
(def padding {:x (* 2 font-size) :y (* 2 font-size)})
;; A macOS window's title bar, with its close, minimize and zoom buttons.
(def title-bar-height 28)
(def window-radius 12)
(def traffic-lights ["#ff5f57" "#febc2e" "#28c840"])

(defn title-bar [w]
  (list [:g {:clip-path "url(#window)"}
         [:rect {:width w :height title-bar-height :fill "#ffffff" :fill-opacity 0.06}]
         [:rect {:y title-bar-height :width w :height 1
                 :fill "#000000" :fill-opacity 0.4}]]
        (map-indexed (fn [i color]
                       [:circle {:cx (+ (/ title-bar-height 2) (* 20 i))
                                 :cy (/ title-bar-height 2) :r 6
                                 :fill color}])
                     traffic-lights)))

(defn tspan [{:keys [text bold] :as span}]
  [:tspan {:fill (rgb->hex (shown-rgb span)) :font-weight (when bold "bold")} text])

(defn svg-line [i line]
  (let [spans (filter (comp seq :text) line)
        indicator (when (= "⏺ " (:text (first spans))) (first spans))
        x (:x padding)
        y (+ title-bar-height (:y padding) (* (inc i) line-height)
             (* -0.3 font-size))]
    ;; Draw the status dot geometrically so mobile fonts cannot substitute an emoji.
    (list
     (when indicator
       [:circle {:cx (+ x (/ cell-width 2)) :cy (- y (* 0.35 font-size))
                 :r (* 0.28 font-size) :fill (rgb->hex (shown-rgb indicator))}])
     [:text {:x (+ x (if indicator (* 2 cell-width) 0)) :xml:space "preserve" :y y}
      (map tspan (if indicator (rest spans) spans))])))

;; Unit-radius corner extracted from SwiftUI RoundedRectangle(style: .continuous).
;; Three cubic curves ease from a straight edge into the corner and back out.
;; https://developer.apple.com/documentation/swiftui/roundedcornerstyle/continuous
(def continuous-corner
  [[[0 1.528664947]]
   [[0 1.088490009] [0 0.868407011] [0.074911401 0.631493986]]
   [[0.169060007 0.372824013] [0.372824013 0.169060007] [0.631493986 0.074911401]]
   [[0.868407011 0] [1.088490009 0] [1.528664947 0]]])

;; Share one outline for the fill, title-bar clip and border, inset half a pixel.
(defn window-shape [w h attrs]
  (let [lo 0.5
        right (- w lo)
        bottom (- h lo)
        transforms [(fn [x y] [(+ lo x) (+ lo y)])
                    (fn [x y] [(- right y) (+ lo x)])
                    (fn [x y] [(- right x) (- bottom y)])
                    (fn [x y] [(+ lo y) (- bottom x)])]
        commands (map-indexed
                  (fn [i transform]
                    (map-indexed
                     (fn [j points]
                       (str (if (zero? j) (if (zero? i) "M" "L") "C")
                            (str/join " "
                                      (for [[x y] points
                                            v (transform (* window-radius x)
                                                         (* window-radius y))]
                                        (format "%.4f" v)))))
                     continuous-corner))
                  transforms)]
    [:path (merge {:d (str (str/join " " (apply concat commands)) " Z")} attrs)]))

(defn svg [lines]
  ;; Spare columns: bold text can run wider than a cell.
  (let [w (+ (* 2 (:x padding)) (* cell-width (+ 4 (apply max (map width lines)))))
        h (+ title-bar-height (* 2 (:y padding)) (* line-height (count lines)))]
    (str
     (h/html
      {:mode :xml}
      [:svg {:xmlns "http://www.w3.org/2000/svg" :width w :height h
             :viewBox (str "0 0 " w " " h)
             :font-family font-family :font-size font-size}
       [:clipPath {:id "window"} (window-shape w h {})]
       (window-shape w h {:fill (:background theme)})
       (title-bar w)
       (map-indexed svg-line lines)
       ;; A light 1px border sets the image off from a dark page.
       (window-shape w h {:fill "none" :stroke "#ffffff" :stroke-opacity 0.3})])
     "\n")))

(when (= *file* (System/getProperty "babashka.file"))
  (let [lines (vec (mapcat #(layout % {} terminal-columns) (drawn-trees)))]
    (println (ansi lines))
    (spit (str (fs/path root "screenshot.svg")) (svg lines))
    (println "Wrote screenshot.svg")))
