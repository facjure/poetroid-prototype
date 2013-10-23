cd ../frozen-pie
bake.py --config /Users/priyatam/Dev/github/facjure/poetics/config.yml
cd ../poetics
cp js/* .build/*
cd .build
python -m SimpleHTTPServer

