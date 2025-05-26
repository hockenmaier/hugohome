# deploy.sh
#!/usr/bin/env bash
set -e

hugo
cd public
git add --all
git commit -m "deploying latest"
git push origin gh-pages
cd ..
