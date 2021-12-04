# 1. Az Angular alkalmazás lefordítása.

FROM node:latest as frontend-build

ENV NODE_OPTIONS=--openssl-legacy-provider

WORKDIR /frontend

COPY . .

RUN npm install

RUN npm run build

# 2. Az Angular alkalmazás kiszolgálása nginx web szerverrel.

FROM nginx:latest

COPY --from=frontend-build /frontend/dist/mean-project /usr/share/nginx/html

EXPOSE 80