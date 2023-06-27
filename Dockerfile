FROM node:16 as builder

RUN set -eux &&\
    apt update &&\
    apt install -y \
        libudev-dev \
        libusb-1.0-0-dev

WORKDIR /app

COPY ./package*.json ./

RUN set -eux && \
    npm install --include=dev && \
    npm install -g typescript react-scripts && \
    sed -e 's|.https://assets.terra.money/extensions.json.|process.env.ASSETS ? `${process.env.ASSETS}/extensions.json` : `https://assets.terra.money/extensions.json`|g' \
        -i /app/node_modules/@terra-money/wallet-controller/operators/getExtensions.js && \
    sed -e 's|.https://assets.terra.money/extensions.json.|process.env.ASSETS ? `${process.env.ASSETS}/extensions.json` : `https://assets.terra.money/extensions.json`|g' \
        -i /app/node_modules/@terra-money/wallet-controller/_commonjs/operators/getExtensions.js && \
    sed -e 's|.https://assets.terra.money/station/chains.json.|process.env.ASSETS ? `${process.env.ASSETS}/station/chains.json` : `https://assets.terra.money/station/chains.json`|g' \
        -i /app/node_modules/@terra-money/wallet-controller/getChainOptions.js && \
    sed -e 's|.https://assets.terra.money/station/chains.json.|process.env.ASSETS ? `${process.env.ASSETS}/station/chains.json` : `https://assets.terra.money/station/chains.json`|g' \
        -i /app/node_modules/@terra-money/wallet-controller/_commonjs/getChainOptions.js

COPY . .

RUN set -eux && \
    npm run build --openssl-legacy-provider

###############################################################################

FROM node:16-alpine

WORKDIR /app

COPY --from=builder /app/build .

ENV ASSETS="https://assets.terra.money" \
    STATION_ASSETS="https://station-assets.terra.money"

RUN set -eux && \
    npm install -g serve

CMD ["serve", "-s", "."]
