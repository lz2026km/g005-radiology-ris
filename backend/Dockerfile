FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl
COPY package.json pnpm-lock.yaml* ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY prisma ./prisma
RUN pnpm prisma generate
COPY tsconfig.json nest-cli.json ./
COPY src ./src
RUN pnpm build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache openssl \
    && addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
RUN chown -R appuser:appgroup /app
USER appuser
EXPOSE 3001
CMD ["node", "dist/main.js"]
