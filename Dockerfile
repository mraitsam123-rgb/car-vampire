# Build Stage for Frontend
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Final Stage
FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache ca-certificates && update-ca-certificates

# Copy server files maintaining structure
COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev
COPY server/ ./server/

# Copy frontend build maintaining structure
COPY --from=client-builder /app/client/dist ./client/dist

ENV NODE_ENV=production
EXPOSE 7860
# Run from the server directory
WORKDIR /app/server
CMD ["node", "src/index.js"]
