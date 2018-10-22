export PATH := ./node_modules/.bin:$(PATH)
.DEFAULT_GOAL := build

prebuild:
	rm -rf dashboard graphics extension build types/schemas
	node scripts/schema-types.js

build: prebuild
	tsc --build src/dashboard src/graphics src/extension
	parcel build src/dashboard/*.html --out-dir dashboard --public-url . --detailed-report
	parcel build src/graphics/*.html --out-dir graphics --public-url . --detailed-report

dev:
	concurrently --raw \
		"tsc --build src/dashboard src/graphics src/extension --watch --preserveWatchOutput" \
		"parcel watch src/dashboard/*.html --out-dir dashboard --public-url ." \
		"parcel watch src/graphics/*.html --out-dir graphics --public-url ." \
		"onchange schemas --initial -- node scripts/schema-types.js"

lint:
	tslint --format stylish --project .

format:
	tslint --format stylish --project . --fix
	prettier "src/**/*.{ts,tsx}" --write
