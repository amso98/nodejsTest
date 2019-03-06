FROM node:10.15-alpine
WORKDIR /app
COPY . /app
RUN npm install && apk add --no-cache curl
EXPOSE 3000
HEALTHCHECK CMD curl -f http://localhost:3000/health || exit 1
CMD ["node", "app.js"]