FROM node:18-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package*.json .
RUN npm i --legacy-peer-deps

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules/ .
COPY --from=deps /app/package*.json .
RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/ .
RUN chown -R nextjs:nodejs /app

COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

USER nextjs

EXPOSE 3000

ENV PORT 3000
# set hostname to localhost
ENV HOSTNAME "0.0.0.0"

ENTRYPOINT ["entrypoint.sh"]
CMD ["npm", "run", "start"]
