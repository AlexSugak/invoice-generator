FROM node:20-alpine

WORKDIR /app

ARG NEXT_PUBLIC_API_HOST
ARG NEXT_PUBLIC_API_KEY

ENV NEXT_PUBLIC_API_HOST=$NEXT_PUBLIC_API_HOST
ENV NEXT_PUBLIC_API_KEY=$NEXT_PUBLIC_API_KEY
ENV NODE_ENV=production
ENV AUTH_TRUST_HOST=true

# Copy workspace files
COPY package.json yarn.lock .yarnrc.yml tsconfig.base.json ./
COPY .yarn .yarn
COPY packages/common/package.json packages/common/
COPY packages/web/package.json packages/web/

# Install dependencies
RUN corepack enable && \
    yarn install

# Copy source code
COPY packages/common packages/common
COPY packages/web packages/web

# Build packages
RUN yarn workspace @invoice/common build && \
    yarn workspace @invoice/web build

EXPOSE 3000
CMD ["yarn", "workspace", "@invoice/web", "start"]