#
# BUILD STAGE
#
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application source code
COPY . .

#
# PRODUCTION STAGE
#
FROM node:18-alpine

WORKDIR /app

# Copy package files and install only production dependencies
COPY package*.json ./
# RUN npm ci --only=production

# Copy the application code from the build stage
COPY --from=build /app .

EXPOSE 3000

CMD ["npm", "start"]
