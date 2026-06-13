FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY server/package*.json ./server/
RUN npm install
COPY server ./server
RUN npm run build --workspace server

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
COPY server/package*.json ./server/
RUN npm install --omit=dev --workspace server
COPY --from=build /app/server/dist ./server/dist
WORKDIR /app/server
EXPOSE 5000
CMD ["npm", "start"]
