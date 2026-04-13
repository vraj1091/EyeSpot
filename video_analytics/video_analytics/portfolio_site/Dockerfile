# Build stage
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG VITE_PORTFOLIO_API_BASE=/api
ENV VITE_PORTFOLIO_API_BASE=$VITE_PORTFOLIO_API_BASE
ARG VITE_ENABLE_PORTFOLIO_REMOTE_SYNC=true
ENV VITE_ENABLE_PORTFOLIO_REMOTE_SYNC=$VITE_ENABLE_PORTFOLIO_REMOTE_SYNC
ENV NODE_OPTIONS="--max-old-space-size=2048"
RUN npm run build
# Production stage
FROM nginx:alpine
ARG PORTFOLIO_API_UPSTREAM=http://portfolio-api:8000
COPY --from=build /app/dist /usr/share/nginx/html
# Add custom nginx config for React Router SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN sed -i "s|__PORTFOLIO_API_UPSTREAM__|${PORTFOLIO_API_UPSTREAM}|g" /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
