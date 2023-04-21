FROM node:20-slim AS build-base

RUN apt-get update
RUN apt-get install -y build-essential python git


FROM build-base AS node_modules

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production


FROM node_modules AS build

RUN yarn install --frozen-lockfile

COPY schemas schemas
COPY src src
COPY webpack-templates webpack-templates
COPY \
  .babelrc \
  configschema.json \
  tsconfig.json \
  webpack.config.ts \
  ./

ENV NODE_ENV production
RUN yarn build


FROM build-base AS nodecg

RUN git clone https://github.com/nodecg/nodecg.git /app
WORKDIR /app
RUN git checkout 48f0e82555ad5550afbb47e89fbce3fc7908d2fe
RUN npm ci --production


FROM node:20-slim

COPY --from=nodecg /app /app

WORKDIR /app/bundles/jr-layouts
COPY --from=build /app/dashboard dashboard
COPY --from=build /app/graphics graphics
COPY --from=build /app/extension extension
COPY --from=build /app/schemas schemas
COPY --from=node_modules /app/node_modules ./node_modules
COPY assets assets
COPY package.json configschema.json ./

WORKDIR /app

VOLUME ["/app/db"]
CMD ["node", "index.js"]
