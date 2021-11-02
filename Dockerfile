FROM node:15.8.0-alpine3.10 as build-step

WORKDIR /app

COPY . .
COPY docker-package.json ./package.json
RUN npm ci --ignore-scripts --no-progress --loglevel=error

RUN npm run build-prod

FROM nginx:1.19.6-alpine as prod-stage
COPY default.conf /etc/nginx/conf.d/default.conf
COPY --from=build-step /app/dist/cryton-frontend /usr/share/nginx/html
