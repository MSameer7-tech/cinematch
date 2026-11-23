# Stage 1: Build the React application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the source and build
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Optional: Copy custom Nginx configuration if SPA routing is needed
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose Nginx default port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
