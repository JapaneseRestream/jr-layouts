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

ARG BUILD_DATE
ARG VCS_REF
ARG VERSION
LABEL org.label-schema.build-date=${BUILD_DATE} \
	org.label-schema.name="jr-layouts" \
	org.label-schema.description="Japanese Restream stream overlay management backend" \
	org.label-schema.url="https://twitch.tv/japanese_restream" \
	org.label-schema.vcs-ref=${VCS_REF} \
	org.label-schema.vcs-url="e.g. https://github.com/JapaneseRestream/jr-layouts" \
	org.label-schema.vendor="Japanese Restream" \
	org.label-schema.version=${VERSION} \
	org.label-schema.schema-version="1.0"

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
