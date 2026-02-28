# Build Stage for Frontend
FROM node:20-alpine AS client-builder
WORKDIR /app/client
# Copy only client package files first to leverage Docker cache
COPY client/package*.json ./
RUN npm install
# Copy the rest of the client code
COPY client/ ./
RUN npm run build

# Final Stage
FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache ca-certificates && update-ca-certificates

# Copy server files
COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev
COPY server/ ./server/

# Copy frontend build directly into the server folder for easier access
COPY --from=client-builder /app/client/dist ./server/client/dist

ENV NODE_ENV=production
EXPOSE 7860
# Run from the server directory
WORKDIR /app/server
CMD ["node", "src/index.js"]
