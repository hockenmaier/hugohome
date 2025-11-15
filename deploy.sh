# deploy.sh
#!/usr/bin/env bash
set -e

hugo
cd public
git add --all
git commit -m "deploying latest" || true   # ignore "nothing to commit"
git push origin gh-pages --force
cd ..
