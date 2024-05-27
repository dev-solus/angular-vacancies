FROM node:18.16.1-alpine3.18 as build-env
WORKDIR /app

# copy and cahe
COPY package*.json ./

RUN npm i --force

COPY src src
COPY .editorconfig .
COPY .eslintrc.json .
COPY angular.json .
# COPY server.ts .
COPY transloco.config.js .
COPY tailwind.config.js .
COPY tsconfig*.json ./

RUN npm run prod
# RUN ls -al

FROM nginx:alpine
WORKDIR /usr/share/nginx/html

RUN rm -rf ./*
COPY ./ngx.conf /etc/nginx/conf.d/default.conf

COPY --from=build-env /app/dist .
# COPY ./dist .

ENTRYPOINT [ "nginx", "-g", "daemon off;" ]
