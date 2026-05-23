FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev
COPY . .
RUN npm run build

FROM nginx:alpine
RUN apk add --no-cache logrotate

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 日志轮转
COPY logrotate.conf /etc/logrotate.d/nginx
RUN mkdir -p /var/log/nginx

EXPOSE 80
CMD ["sh", "-c", "logrotate /etc/logrotate.d/nginx && nginx -g 'daemon off;'"]
