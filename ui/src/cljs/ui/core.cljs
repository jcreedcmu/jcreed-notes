(ns ui.core
    (:require [reagent.core :as reagent :refer [atom]]
              [reagent.session :as session]
              [secretary.core :as secretary :include-macros true]
              [goog.events :as events]
              [goog.history.EventType :as EventType]
              [ajax.core :refer [GET]])
    (:import goog.History))

(enable-console-print!)

;; -------------------------
;; Views

(defn collate [lines]
  (let [[collated _]
        (reduce (fn [[acc current] line]
                  (if-let [match (re-matches #"^=== (.*)" line)]
                    (let [date (get match 1)]
                      [(assoc acc date []) date])
                    [(update acc current #(conj % line)) current]))
                [{} nil]
                lines)]
    collated))

(defn markup-lines [lines]
  (map
   (fn [line]
     (condp (comp seq re-seq) line
       #"^Q: (.*)" :>> #(do [:span [:span.pill.type-q "Q"] [:span.bold (second (first %))] "\n"])
       #"^A: (.*)" :>> #(do [:span [:span.pill.type-a "A"] (second (first %)) "\n" ])
       #"^A:$" :>> #(do [:span ])
   (str line "\n")
   ))
   lines))

(GET "/api/notes" {:handler #(session/put! :data %)
                   :keywords? true
                   :response-format :json})

(defn home-page []
  [:div
   (for [entry (session/get :data)]
     (let [{:keys [date lines]} entry]
       ^{:key date} [:div.day
                     [:div.date date]
                     `[:div.entry
                        ~@(markup-lines lines)
                       ]]))])

;; -------------------------
;; Initialize app
(defn mount-root []
  (reagent/render [home-page] (.getElementById js/document "app")))

(defn init! []
  (mount-root))
