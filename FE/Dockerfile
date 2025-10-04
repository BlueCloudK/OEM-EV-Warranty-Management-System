# Stage 1: Build React app
FROM node:20 AS build

WORKDIR /app

# Copy package.json + package-lock.json (nếu có)
COPY OEM-EV-Warranty-Management-System/package*.json ./

# Cài dependencies
RUN npm install

# Copy toàn bộ source code
COPY OEM-EV-Warranty-Management-System ./

# Build project
RUN npm run build

# Stage 2: Serve app với Nginx
FROM nginx:alpine

# Copy file build ra dist vào nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
