FROM node:14-alpine AS build

RUN apk add --no-cache git

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

RUN NODE_ENV=production yarn build


FROM node:14-alpine AS node_modules

RUN apk add --no-cache git

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --production --frozen-lockfile


FROM node:14-alpine

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
