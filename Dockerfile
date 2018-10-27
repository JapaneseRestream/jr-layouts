FROM node:10.12.0-alpine as builder

RUN apk --no-cache add curl make git util-linux

WORKDIR /tmp

RUN curl -L https://github.com/nodecg/nodecg/archive/master.tar.gz > ./nodecg.tar.gz \
	&& tar xzf /tmp/nodecg.tar.gz \
	&& mv /tmp/nodecg-master /nodecg \
	&& cp -R /nodecg /nodecg-raw

WORKDIR /nodecg

RUN npm install --production

WORKDIR /nodecg/bundles/jr-layouts

COPY schemas ./schemas
COPY scripts ./scripts
COPY src ./src
COPY types ./types
COPY configschema.json Makefile package.json tsconfig.json yarn.lock ./

RUN yarn install && make build -j

FROM node:10.12.0-alpine

RUN apk --no-cache add git

COPY --from=builder  /nodecg-raw /nodecg

WORKDIR /nodecg

RUN npm install -g bower \
	&& npm install --production \
	&& bower install --production --allow-root

WORKDIR /nodecg/bundles/jr-layouts

COPY --from=builder /nodecg/bundles/jr-layouts/dashboard ./dashboard
COPY --from=builder /nodecg/bundles/jr-layouts/extension ./extension
COPY --from=builder /nodecg/bundles/jr-layouts/graphics ./graphics
COPY --from=builder /nodecg/bundles/jr-layouts/schemas ./schemas
COPY --from=builder \
	/nodecg/bundles/jr-layouts/configschema.json \
	/nodecg/bundles/jr-layouts/package.json \
	/nodecg/bundles/jr-layouts/yarn.lock \
	./

RUN yarn install --production

WORKDIR /nodecg

CMD ["node", "index.js"]
