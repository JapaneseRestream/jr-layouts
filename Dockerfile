FROM node:20-slim AS build-base

RUN apt-get update && apt-get install -y python3 build-essential
RUN corepack enable

WORKDIR /tmp
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile


FROM node:20-slim AS nodecg

ADD https://github.com/nodecg/nodecg/releases/download/v2.1.5/nodecg-2.1.5.tgz /nodecg.tgz
RUN mkdir /nodecg && tar -xzvf /nodecg.tgz -C /nodecg --strip-components=1
RUN ls -al /nodecg
WORKDIR /nodecg
RUN npm install --package-lock=false --omit=dev


FROM build-base AS build

WORKDIR /jr-layouts

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY configschema.json tsconfig.json vite-plugin-nodecg.mts vite.config.mts ./
COPY schemas schemas
COPY src src
RUN pnpm build


FROM build-base AS npm

WORKDIR /jr-layouts

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --production


FROM node:20-slim

COPY --from=nodecg /nodecg /nodecg

WORKDIR /nodecg/bundles/jr-layouts

COPY --from=npm /jr-layouts/package.json ./
COPY --from=npm /jr-layouts/node_modules node_modules

COPY --from=build /jr-layouts/dashboard dashboard
COPY --from=build /jr-layouts/extension extension
COPY --from=build /jr-layouts/graphics graphics

WORKDIR /nodecg

CMD ["node", "index.js"]
