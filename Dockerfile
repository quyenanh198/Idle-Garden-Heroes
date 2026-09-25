# syntax=docker/dockerfile:1
# Idle Garden Hero: standalone web game with hardened static server.
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY index.html vite.config.js ./
COPY public ./public
COPY src ./src
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=8095
COPY --from=build /app/dist ./dist
COPY server ./server
COPY package.json ./
USER node
EXPOSE 8095
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8095/healthz || exit 1
CMD ["node", "server/server.js"]
