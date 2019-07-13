FROM node:10 AS build

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY tsconfig.json webpack.config.ts ./
COPY src ./src
COPY webpack-templates ./webpack-templates
RUN NODE_ENV=production yarn build


FROM node:10 AS node-modules

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --production --frozen-lockfile


FROM node:10

ADD https://github.com/krallin/tini/releases/download/v0.18.0/tini /tini
RUN chmod +x /tini

WORKDIR /app
RUN mkdir -p cfg db
COPY package.json configschema.json ./
COPY schemas ./schemas
COPY --from=node-modules /app/node_modules ./node_modules
COPY --from=build /app/dashboard ./dashboard
COPY --from=build /app/extension ./extension
COPY --from=build /app/graphics ./graphics

CMD ["/tini", "--", "yarn", "start"]
