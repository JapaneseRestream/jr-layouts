FROM node:14-slim AS build

RUN apt-get update && apt-get upgrade
RUN apt-get install -y build-essential python git

WORKDIR /app

COPY package.json yarn.lock ./

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


FROM node:14-slim AS node_modules

RUN apt-get update && apt-get upgrade
RUN apt-get install -y build-essential python git

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile --production


FROM node:14-slim

WORKDIR /app

COPY --from=build /app/dashboard dashboard
COPY --from=build /app/graphics graphics
COPY --from=build /app/extension extension
COPY --from=build /app/schemas schemas
COPY --from=node_modules /app/node_modules ./node_modules
COPY --from=node_modules /app/.nodecg .nodecg
COPY assets assets
COPY package.json configschema.json ./

EXPOSE 9090
VOLUME ["/app/.nodecg/db"]

CMD ["yarn", "start"]
