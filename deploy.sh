set -eu

pnpm prod-build

rsync -avh --delete --checksum \
dashboard extension graphics schemas \
configschema.json package.json package-lock.json \
$1
