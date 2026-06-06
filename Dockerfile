# Stage 1 — Build (vérification des fichiers)
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN echo "Build OK — files ready"

# Stage 2 — Serve avec Nginx ultra-léger
FROM nginx:alpine
COPY --from=builder /app /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]