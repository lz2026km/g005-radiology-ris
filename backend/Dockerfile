FROM node:20-alpine AS builder
WORKDIR /app
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
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
EXPOSE 3001
CMD ["node", "dist/main.js"]
