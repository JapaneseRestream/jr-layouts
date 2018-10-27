FROM hoishin/nodecg:latest as build

RUN apk --no-cache add make util-linux

WORKDIR /nodecg/bundles/jr-layouts

COPY schemas ./schemas
COPY scripts ./scripts
COPY src ./src
COPY types ./types
COPY configschema.json Makefile package.json tsconfig.json yarn.lock ./

RUN yarn install && make build -j

FROM hoishin/nodecg:latest

WORKDIR /nodecg/bundles/jr-layouts

COPY --from=build /nodecg/bundles/jr-layouts/dashboard ./dashboard
COPY --from=build /nodecg/bundles/jr-layouts/extension ./extension
COPY --from=build /nodecg/bundles/jr-layouts/graphics ./graphics
COPY --from=build /nodecg/bundles/jr-layouts/schemas ./schemas
COPY --from=build \
	/nodecg/bundles/jr-layouts/configschema.json \
	/nodecg/bundles/jr-layouts/package.json \
	/nodecg/bundles/jr-layouts/yarn.lock \
	./

RUN yarn install --production

WORKDIR /nodecg

CMD ["node", "index.js"]
