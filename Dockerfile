FROM node:16.13-alpine as build-step

WORKDIR /app

COPY . .
COPY docker-package.json ./package.json
RUN npm install --ignore-scripts --no-progress --loglevel=error --legacy-peer-deps

RUN npm run build-prod

FROM nginx:1.21-alpine as prod-stage
COPY default.conf /etc/nginx/conf.d/default.conf
COPY --from=build-step /app/dist/cryton-frontend /usr/share/nginx/html
