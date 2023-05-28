set -eu

pnpm build

rsync -avh --delete --checksum \
dashboard extension graphics schemas shared \
configschema.json package.json pnpm-lock.yaml \
$1
