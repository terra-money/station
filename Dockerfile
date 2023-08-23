FROM node:16 as builder

WORKDIR /app

RUN set -eux &&\
    apt update &&\
    apt install -y \
    libudev-dev \
    libusb-1.0-0-dev

COPY package*.json ./
COPY tsconfig.json ./

RUN set -eux && \
    npm install -g typescript react-scripts && \
    npm install --include=dev

COPY . .

ARG REACT_APP_ASSETS="https://assets.terra.dev" \
    REACT_APP_STATION_ASSETS="https://station-assets.terra.dev"

ENV REACT_APP_ASSETS=${REACT_APP_ASSETS} \
    REACT_APP_STATION_ASSETS=${REACT_APP_STATION_ASSETS}

RUN set -eux && \
    npm run build --openssl-legacy-provider

###############################################################################

FROM node:16 as reloader

ARG REACT_APP_ASSETS="https://assets.terra.dev" \
    REACT_APP_STATION_ASSETS="https://station-assets.terra.dev"

ENV REACT_APP_ASSETS=${REACT_APP_ASSETS} \
    REACT_APP_STATION_ASSETS=${REACT_APP_STATION_ASSETS}

# add node modules to parent directory
COPY --from=builder /app/node_modules /app/node_modules
ENV PATH=/app/node_modules/.bin:$PATH

# use bind mount to enable hot reloading
WORKDIR /app/src
COPY . .

CMD ["npm", "run", "start"]

###############################################################################

FROM node:16-alpine

WORKDIR /app
COPY --from=builder /app/build .

RUN set -eux && \
    npm install -g serve

CMD ["serve", "-s", "."]
