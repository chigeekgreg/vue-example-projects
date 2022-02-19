FROM node:16.0-alpine
RUN apk --no-cache add curl
WORKDIR /usr/src/app
COPY config.json package*.json ./
RUN npm install --quiet
COPY app.js ./
EXPOSE 3001
CMD ["node", "app.js"]
HEALTHCHECK --interval=5s --timeout=2s --start-period=3s --retries=1 \
        CMD curl --fail http://localhost:3001 || exit 1