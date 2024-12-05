# Build command on Apple M1: docker buildx build --platform linux/amd64 --push -t vaimeedock/wda.vaimee.com:latest .
FROM nginx:alpine

COPY / /usr/share/nginx/html

RUN apk update && apk upgrade && apk add bash

WORKDIR /usr/share/nginx/html

RUN chmod +x deploy.sh
RUN ./deploy.sh /usr/share/nginx/html

RUN mv index-deploy.html index.html
RUN mv history-deploy.html history.html
RUN mv compare-deploy.html compare.html