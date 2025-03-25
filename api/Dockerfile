# Stage 1: Compilation
FROM node:23-alpine AS build

WORKDIR /api

COPY package.json package-lock.json ./

# Install dependencies first for better caching
# Clean install to ensure exact versions
RUN npm clean-install

# copy source code
COPY tsconfig.json ./
COPY src ./src

# Compile the typescript code
RUN npm run build

# Stage 2: Production image
FROM node:23-alpine

WORKDIR /api

COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm clean-install --only=production

COPY --from=build /api/dist ./dist

ENV PORT=8080
EXPOSE 8080

CMD ["npm", "start"]
