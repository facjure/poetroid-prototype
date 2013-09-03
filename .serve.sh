version = $1
cp .build/index.html /Users/priyatam/Dev/github-pages/priyatam.com
cd /Users/priyatam/Dev/github-pages/priyatam.com
git commit index.html -m $1
git push
