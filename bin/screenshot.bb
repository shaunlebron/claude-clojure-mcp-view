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
         '[clojure.string :as str])

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

(defn layout [node st]
  (let [{:strs [type props children]} node
        st (style props st)]
    (case type
      "Text"            (spans->lines (text-spans children st))
      "Button"          (spans->lines (text-spans [(get props "label")] st))
      "Box"             (let [kids (map #(layout % st) (remove nil? (flatten children)))
                              body (if (= "column" (get props "flexDirection"))
                                     (vec (apply concat kids))
                                     (side-by-side kids))
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

(defn xml-escape [s]
  (str/escape s {\& "&amp;" \< "&lt;" \> "&gt;" \" "&quot;"}))

(defn rgb->hex [rgb] (apply format "#%02x%02x%02x" rgb))

;; The viewer draws the text, in the first of these fonts it has; none has ligatures.
(def font-family "'SF Mono', Menlo, Consolas, 'DejaVu Sans Mono', monospace")
(def font-size 16)
(def cell-width (* 0.6 font-size))
(def line-height (* 1.35 font-size))
(def padding {:x (* 2 font-size) :y (* 2 font-size)})

(defn tspan [{:keys [text bold] :as span}]
  (str "<tspan fill=\"" (rgb->hex (shown-rgb span)) "\""
       (when bold " font-weight=\"bold\"")
       ">" (xml-escape text) "</tspan>"))

(defn svg [lines]
  ;; Spare columns: bold text and a fallback font's ⏺ run wider than a cell.
  (let [w (+ (* 2 (:x padding)) (* cell-width (+ 4 (apply max (map width lines)))))
        h (+ (* 2 (:y padding)) (* line-height (count lines)))]
    (str "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"" w "\" height=\"" h "\""
         " font-family=\"" font-family "\" font-size=\"" font-size "\">\n"
         ;; A light 1px border, inset half a pixel so it isn't clipped, sets the image off
         ;; from a dark page.
         "<rect x=\"0.5\" y=\"0.5\" width=\"" (dec w) "\" height=\"" (dec h) "\" rx=\"6\""
         " fill=\"" (:background theme) "\" stroke=\"#ffffff\" stroke-opacity=\"0.3\"/>\n"
         (str/join (map-indexed
                    (fn [i line]
                      (str "<text x=\"" (:x padding) "\" y=\""
                           (+ (:y padding) (* (inc i) line-height) (* -0.3 font-size))
                           "\" xml:space=\"preserve\">"
                           (str/join (map tspan (filter (comp seq :text) line)))
                           "</text>\n"))
                    lines))
         "</svg>\n")))

(when (= *file* (System/getProperty "babashka.file"))
  (let [lines (vec (mapcat #(layout % {}) (drawn-trees)))]
    (println (ansi lines))
    (spit (str (fs/path root "screenshot.svg")) (svg lines))
    (println "Wrote screenshot.svg")))
