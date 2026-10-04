# ─── Etapa 1: Build ───────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package.json y lock
COPY package*.json ./

# Instalar dependencias (incluye dev para el build)
RUN npm ci

# Copiar el resto del código
COPY . .

# Build de producción (genera /app/dist)
RUN npm run build

# ─── Etapa 2: Servir con Nginx ────────────────────────────
FROM nginx:alpine

# Copiar los archivos estáticos generados
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración de Nginx (SPA fallback)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]