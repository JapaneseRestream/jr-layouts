set -eu

npm run prod-build

rsync -avh --delete --checksum \
dashboard extension graphics schemas \
configschema.json package.json package-lock.json \
$1
