export PATH := ./node_modules/.bin:$(PATH)
.DEFAULT_GOAL := build

.PHONY: build
build: build-extension build-dashboard build-graphics
prebuild: clean
	node scripts/schema-types.js
	tsc --build types
build-extension: prebuild
	tsc --build src/extension
build-dashboard: prebuild
	tsc --build src/extension
	parcel build src/dashboard/*.html --out-dir dashboard --public-url . --detailed-report
build-graphics: prebuild
	tsc --build src/graphics
	parcel build src/graphics/*.html --out-dir graphics --public-url . --detailed-report

dev: dev-tsc dev-dashboard dev-graphics dev-schema-types
predev: prebuild
dev-tsc: predev
	tsc --build src/dashboard src/graphics src/extension --watch --preserveWatchOutput
dev-dashboard: predev
	parcel watch src/dashboard/*.html --out-dir dashboard --public-url .
dev-graphics: predev
	parcel watch src/graphics/*.html --out-dir graphics --public-url .
dev-schema-types: predev
	onchange schemas --initial -- node scripts/schema-types.js

clean:
	rm -rf dashboard graphics extension build types/schemas

lint:
	tslint --format stylish --project .

format:
	tslint --format stylish --project . --fix
	prettier "src/**/*.{ts,tsx}" --write
