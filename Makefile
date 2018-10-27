export PATH := ./node_modules/.bin:$(PATH)
BUILD_DATE=$$(date -u +"%Y-%m-%dT%H:%M:%SZ")

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
	tsc --build types src/dashboard src/graphics src/extension  --watch

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

.PHONY: docker-login
docker-login:
	echo $(DOCKER_PASSWORD) | docker login -u $(DOCKER_USERNAME) --password-stdin

.PHONY: docker-build
docker-build:
	docker build --tag $(DOCKER_IMAGE_NAME_TAG) . \
		--build-arg VCS_REF=$$(git rev-parse --short HEAD) \
		--build-arg BUILD_DATE=$(BUILD_DATE) \
		--build-arg VERSION=$(TRAVIS_BRANCH)

.PHONY: docker-push-branch
docker-push-branch:
	docker tag $(DOCKER_IMAGE_NAME_TAG) $(DOCKER_IMAGE_NAME):$(TRAVIS_BRANCH)
	docker push $(DOCKER_IMAGE_NAME):$(TRAVIS_BRANCH)

.PHONY: docker-push-latest
docker-push-latest:
	docker tag $(DOCKER_IMAGE_NAME_TAG) $(DOCKER_IMAGE_NAME):latest
	docker push $(DOCKER_IMAGE_NAME):latest
