FROM node:18-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN ln -sf /dev/stdout /app/logs/next-access.log && \
    ln -sf /dev/stderr /app/logs/next-error.log

EXPOSE 3000
CMD ["npm", "run", "dev"]

# for release:
# FROM node:18-alpine
# WORKDIR /app
# COPY package.json package-lock.json ./
# RUN npm ci
# COPY . .
# RUN npm run build
# EXPOSE 3000
# CMD ["npm", "start"]