FROM node:22-bookworm-slim AS base
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json* .npmrc* ./
RUN npm ci

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run better:gen \
 && npm run drizzle:gen:global \
 && npm run drizzle:gen:tenant \
 && npm run build

FROM base AS prod-deps
COPY package.json package-lock.json* .npmrc* ./
RUN npm ci --omit=dev

FROM base AS runner
RUN useradd -m -u 1001 nodeuser
USER nodeuser
WORKDIR /app

COPY --from=build /app/.next ./.next
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/migrations ./migrations

COPY docker/app/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["/entrypoint.sh"]
CMD ["npm","run","start","--","-p","3000"]
