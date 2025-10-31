# Build React app
FROM node:22 AS build
WORKDIR /app
COPY OEM-EV-Warranty-Management-System/package*.json ./
RUN npm install
COPY OEM-EV-Warranty-Management-System ./
RUN npm run build

# Serve with nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
