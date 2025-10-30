ARG NODECG_JSON="{}"
ARG JR_LAYOUTS_JSON="{}"
ARG PNPM_CACHE_ID_PREFIX="jr-layouts-pnpm"


FROM node:22-slim AS base

ENV PNPM_HOME="/pnpm"
RUN corepack enable
RUN apt-get update \
	&& apt-get install -y git \
	&& rm -rf /var/lib/apt/lists/*


FROM base AS build

WORKDIR /app
COPY package.json pnpm-* ./
RUN --mount=type=cache,id=${PNPM_CACHE_ID_PREFIX}-pnpm,target=/pnpm/store pnpm install --frozen-lockfile
COPY configschema.json tsconfig.json vite-plugin-nodecg.mts vite.config.mts ./
COPY schemas schemas
COPY src src
RUN npm run build


FROM build AS npm

WORKDIR /app
COPY package.json pnpm-* ./
RUN --mount=type=cache,id=${PNPM_CACHE_ID_PREFIX}-pnpm,target=/pnpm/store pnpm install --frozen-lockfile --production


FROM base

WORKDIR /app

COPY --from=npm /app/package.json ./
COPY --from=npm /app/node_modules node_modules

COPY --from=build /app/dashboard dashboard
COPY --from=build /app/extension extension
COPY --from=build /app/graphics graphics
COPY --from=build /app/shared shared

RUN mkdir cfg \
	&& echo "${NODECG_JSON}" > cfg/nodecg.json \
	&& echo "${JR_LAYOUTS_JSON}" > cfg/jr-layouts.json

CMD ["node", "--run", "start"]
