# syntax=docker/dockerfile:1

# Portal de la GGIRS · Municipalidad Provincial de Puno
# Imagen en tres etapas: dependencias, build y un runner mínimo con la salida "standalone" de Next.js.
#
#   docker compose up -d --build        (recomendado: ver compose.yaml)
#   docker build -t puno-limpio . && docker run -p 3000:3000 -v puno-datos:/app/data puno-limpio

ARG NODE_VERSION=24-alpine

# ---------- 1. dependencias ----------
FROM node:${NODE_VERSION} AS deps
WORKDIR /app
# libc6-compat: binarios nativos (sharp, lightningcss, oxide) compilados para glibc
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund

# ---------- 2. build ----------
FROM node:${NODE_VERSION} AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Las NEXT_PUBLIC_* se incrustan en el código al construir: se fijan aquí, no al arrancar.
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ARG NEXT_PUBLIC_MAP_TILES
ARG NEXT_PUBLIC_MAP_ATTRIBUTION
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_MAP_TILES=$NEXT_PUBLIC_MAP_TILES \
    NEXT_PUBLIC_MAP_ATTRIBUTION=$NEXT_PUBLIC_MAP_ATTRIBUTION \
    NEXT_OUTPUT=standalone \
    NEXT_TELEMETRY_DISABLED=1

# El token de Facebook NO entra en la imagen: sin él, /actualidad se construye con el aviso
# "Muy pronto…" y, ya en marcha, el contenedor trae las publicaciones con el token que recibe al arrancar.
RUN npm run build

# ---------- 3. runner ----------
FROM node:${NODE_VERSION} AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    DATA_DIR=/app/data

# usuario sin privilegios
RUN addgroup -S -g 1001 nodejs && adduser -S -u 1001 -G nodejs nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# reportes, inscripciones y voluntarios (createJsonStore) y caché de imágenes optimizadas: escribibles
RUN mkdir -p /app/data /app/.next/cache && chown -R nextjs:nodejs /app/data /app/.next/cache
VOLUME ["/app/data"]

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/robots.txt > /dev/null || exit 1

CMD ["node", "server.js"]
