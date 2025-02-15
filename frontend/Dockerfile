# Stage 1: Build Angular App
FROM node:18 AS builder
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy all source code & build the app
COPY . .
RUN npm run build -- --output-path=dist/browser --configuration=production

# Stage 2: Serve Angular App with Nginx
FROM nginx:1.23
WORKDIR /usr/share/nginx/html

# Remove default Nginx static files
RUN rm -rf ./*

# ✅ Fix: Copy built Angular app (browser folder)
COPY --from=builder /app/dist/browser/ .

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
