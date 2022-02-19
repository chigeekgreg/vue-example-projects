FROM nginx AS base
COPY product/Vue /usr/share/nginx/html/product
COPY quote/Vue /usr/share/nginx/html/quote
COPY index.html product.png quote.png thumbnail.png /usr/share/nginx/html/
COPY nginx-default.conf /etc/nginx/conf.d/default.conf
ARG PRODUCT_REST_URL
ARG QUOTE_REST_URL
RUN \
  sed -i "s@http...localhost.3000@${PRODUCT_REST_URL}@g" /usr/share/nginx/html/product/components/*.js && \
  sed -i "s@http...localhost.3001@${QUOTE_REST_URL}@g" /usr/share/nginx/html/quote/components/*.js && \
  sed -i "s@/product/@${PRODUCT_REST_URL}/@g; s@/quote/@${QUOTE_REST_URL}/@g" /etc/nginx/conf.d/default.conf

FROM base AS prod
COPY nginx-default.prod.conf /etc/nginx/conf.d/default.conf
ARG PRODUCT_REST_URL
ARG QUOTE_REST_URL
RUN \
  sed -i "s@/product/@${PRODUCT_REST_URL}/@g; s@/quote/@${QUOTE_REST_URL}/@g" /etc/nginx/conf.d/default.conf
VOLUME /data/nginx/cache

FROM base
COPY pics /usr/share/nginx/html/pics