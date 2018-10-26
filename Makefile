export PATH := ./node_modules/.bin:$(PATH)

.PHONY: noop
noop:

.PHONY: build
build: extension dashboard graphics

.PHONY: dev
dev: dev-tsc dev-dashboard dev-graphics dev-schema-types

.PHONY: schemas
schemas:
	node scripts/schema-types.js

.PHONY: extension
extension: schemas
	tsc --build src/extension

.PHONY: dashboard
dashboard: schemas
	parcel build src/dashboard/*.html --out-dir dashboard --public-url .

.PHONY: graphics
graphics: schemas
	parcel build src/graphics/*.html --out-dir graphics --public-url .

.PHONY: dev-tsc
dev-tsc: schemas
	tsc --watch --preserveWatchOutput --build types src/dashboard src/graphics src/extension

.PHONY: dev-dashboard
dev-dashboard: schemas
	parcel watch src/dashboard/*.html --out-dir dashboard --public-url .

.PHONY: dev-graphics
dev-graphics: schemas
	parcel watch src/graphics/*.html --out-dir graphics --public-url .

.PHONY: dev-schema-types
dev-schema-types: schemas
	onchange schemas --initial -- node scripts/schema-types.js

.PHONY: clean
clean:
	rm -rf dashboard graphics extension build types/schemas

.PHONY: lint
lint:
	tslint --format stylish --project .

.PHONY: format
format:
	tslint --format stylish --project . --fix
	prettier "src/**/*.{ts,tsx}" --write
