# syntax=docker/dockerfile:1
# Idle Garden Hero chạy trong Chat (chat.lazybutts.com/garden/): bản build tĩnh của Vite
# cộng một server nhỏ giữ bản lưu theo tài khoản Chat. Không dependency lúc chạy —
# server chỉ dùng node:http và node:sqlite có sẵn.
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
ENV NODE_ENV=production PORT=8095 DATA_DIR=/data
COPY --from=build /app/dist ./dist
COPY server ./server
COPY package.json ./
RUN mkdir -p /data && chown node:node /data
USER node
EXPOSE 8095
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8095/healthz || exit 1
CMD ["node", "--no-warnings=ExperimentalWarning", "server/server.js"]
