# Build command on Apple M1: docker buildx build --platform linux/amd64 --push -t vaimeedock/wda.vaimee.com:latest .
FROM nginx
COPY / /usr/share/nginx/html

#COPY index-deploy.html /usr/share/nginx/html/index.html
#COPY history-deploy.html /usr/share/nginx/html/history.html
#COPY compare-deploy.html /usr/share/nginx/html/compare.html

RUN chmod +x /usr/share/nginx/html/deploy.sh
RUN /usr/share/nginx/html/deploy.sh /usr/share/nginx/html

RUN cp index-deploy.html /usr/share/nginx/html/index.html
RUN cp history-deploy.html /usr/share/nginx/html/history.html
RUN cp compare-deploy.html /usr/share/nginx/html/compare.html

RUN rm /usr/share/nginx/html/compare-deploy.html
RUN rm /usr/share/nginx/html/index-deploy.html
RUN rm /usr/share/nginx/html/history-deploy.html