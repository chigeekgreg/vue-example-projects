FROM nginx
COPY . /usr/share/nginx/html/
ARG REST_URL
RUN sed -i -r "s@http...localhost.3000@${REST_URL}@g" /usr/share/nginx/html/components/*.js
