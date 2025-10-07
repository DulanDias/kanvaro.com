FROM node:23.10.0-alpine AS node

FROM node AS installer
WORKDIR /app

COPY package*.json *.mjs ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

RUN npm install

COPY . .

RUN npm run build

FROM node AS runner
RUN addgroup -S nodegroup && adduser -S nodeuser -G nodegroup
WORKDIR /app
COPY --from=installer /app ./
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh
RUN chown -R nodeuser:nodegroup /app/.next

USER nodeuser

EXPOSE 3000

ENTRYPOINT ["entrypoint.sh"]
CMD ["npm", "run", "start"]