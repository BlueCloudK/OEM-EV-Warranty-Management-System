# Stage 1: build
FROM node:20 AS build
WORKDIR /app

# Copy package json
COPY OEM-EV-Warranty-Management-System/package*.json ./

# install deps (ci faster + deterministic)
RUN npm ci 

# Copy .env file (QUAN TRỌNG - để Vite đọc biến môi trường)
COPY OEM-EV-Warranty-Management-System/.env ./

# copy source
COPY OEM-EV-Warranty-Management-System ./

# Optional: truyền biến build-time cho Vite (nếu bạn dùng)
# Nếu có file .env thì không cần dòng này nữa, nhưng giữ lại để dự phòng
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# build
RUN npm run build

# Stage 2: serve with nginx
FROM nginx:alpine

# remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# copy your nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# copy build artifacts
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
