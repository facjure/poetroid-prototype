(ns poetroid.data
  (:require [clojure.java.io :as io])
  (:use [datomic.api :only [q db] :as d])
  (:use clojure.pprint))


(def uri "datomic:mem://seattle")

(d/create-database uri)

(def conn (d/connect uri))

(def schema-tx (read-string (slurp (-> "data/seattle-schema.dtm" io/resource io/file))))

@(d/transact conn schema-tx)

(def data-tx (read-string (slurp (-> "data/seed-data.dtm" io/resource io/file))))

(first data-tx)
(second data-tx)

@(d/transact conn data-tx)

(def results (q '[:find ?c :where [?c :community/name]] (db conn)))
(count results)

;; main
(defn -main []
  (print "TODO"))
