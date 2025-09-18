FROM node:20-alpine

WORKDIR /app

ARG NEXTAUTH_URL
ARG API_PORT

ENV NEXTAUTH_URL=$NEXTAUTH_URL
ENV API_PORT=$API_PORT
ENV NODE_ENV=production

# Install Chromium dependencies for Puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Set Puppeteer environment variables
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Copy workspace files
COPY package.json yarn.lock .yarnrc.yml tsconfig.base.json ./
COPY .yarn .yarn
COPY packages/common/package.json packages/common/
COPY packages/pdf-api/package.json packages/pdf-api/

# Install dependencies
RUN corepack enable && \
    yarn install

# Copy source code
COPY packages/common packages/common
COPY packages/pdf-api packages/pdf-api

# Build packages
RUN yarn workspace @invoice/common build && \
    yarn workspace @invoice/pdf-api build

EXPOSE $API_PORT
CMD ["yarn", "workspace", "@invoice/pdf-api", "start:prod"]