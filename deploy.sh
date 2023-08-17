set -eu

npm run build

rsync -avh --delete --checksum \
dashboard extension graphics schemas shared \
configschema.json package.json package-lock.json \
$1
