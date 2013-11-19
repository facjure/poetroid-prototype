(defproject poetroid "0.1.0"
  :min-lein-version "2.0.0"
  :description "Poetroid Web Api"
  :url "https://github.com/Facjure/poetroid"
  :license {:name "Eclipse Public License"
            :url "http://www.eclipse.org/legal/epl-v10.html"}
  :dependencies [[org.clojure/clojure "1.5.1"]
                 [ring "1.2.1"]
                 [compojure "1.1.6"]
                 [de.ubercode.clostache/clostache "1.3.1"]
                 [com.datomic/datomic-free "0.8.4218"]]
  :main poetroid.data)
