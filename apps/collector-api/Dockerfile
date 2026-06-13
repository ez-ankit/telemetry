FROM node:20-alpine AS base
WORKDIR /app
COPY package.json .
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=base /app/dist ./dist
COPY --from=base /app/node_modules ./node_modules
EXPOSE 8081
CMD ["node", "dist/index.js"]
