FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json turbo.json ./
COPY packages/ ./packages/
COPY services/kb-server/ ./services/kb-server/
RUN pnpm install --frozen-lockfile --ignore-scripts
RUN pnpm --filter @x/kb-server... build
RUN pnpm --ignore-scripts --filter @x/kb-server deploy --prod /opt/kb-server

FROM node:22-alpine
WORKDIR /app
COPY --from=build /opt/kb-server/ ./
RUN mkdir -p /data && chown node:node /data
ENV PORT=4000 KB_HOST=0.0.0.0 KB_DATA_DIR=/data
USER node
VOLUME /data
EXPOSE 4000
CMD ["node", "dist/main.js"]
