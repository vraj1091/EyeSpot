FROM node:20-alpine

WORKDIR /app

COPY server.mjs .

ENV PORT=8000
ENV DATA_DIR=/data

VOLUME ["/data"]
EXPOSE 8000

CMD ["node", "server.mjs"]
