FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies only (no devDependencies, no esbuild, no musl ETXTBSY)
COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund && npm cache clean --force

# Copy prebuilt frontend assets and server
COPY dist ./dist
COPY server ./server
COPY public ./public

EXPOSE 3000
CMD ["node", "server/server.js"]
