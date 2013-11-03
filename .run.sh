cd ../frozen-pie/pie
pie.py --config /Users/priyatam/Dev/github/facjure/poetroid/client/config.yml
cd ../poetroid/client
cp js/* .build/*
cd .build
python -m SimpleHTTPServer
open -a "/Applications/Google Chrome.app" .build/index.html
