FROM node:22-alpine AS build
WORKDIR /app
COPY web/package.json web/package-lock.json* ./
RUN npm install
COPY web/ ./
RUN npm run build

FROM nginx:1.27-alpine
# nginx.conf (default, local dev) has no SSO gate; nginx.qa.conf adds the
# Microsoft Entra ID auth_request gate in front of the whole site.
ARG NGINX_CONF_FILE=nginx.conf
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx/${NGINX_CONF_FILE} /etc/nginx/nginx.conf

EXPOSE 80
