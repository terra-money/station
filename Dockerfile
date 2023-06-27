FROM node:16 as builder

WORKDIR /app

RUN set -eux &&\
    apt update &&\
    apt install -y \
        libudev-dev \
        libusb-1.0-0-dev

COPY ./package*.json ./

RUN set -eux && \
    npm install -g typescript react-scripts && \
    npm install --include=dev

COPY . .

ARG REACT_APP_ASSETS="https://assets.terra.money" \
    REACT_APP_STATION_ASSETS="https://station-assets.terra.money"

ENV REACT_APP_ASSETS=${REACT_APP_ASSETS} \
    REACT_APP_STATION_ASSETS=${REACT_APP_STATION_ASSETS}

RUN set -eux && \
    sed -e 's|.https://assets.terra.money/extensions.json.|process.env.REACT_APP_ASSETS ? `${process.env.REACT_APP_ASSETS}/extensions.json` : `https://assets.terra.money/extensions.json`|g' \
        -i /app/node_modules/@terra-money/wallet-controller/operators/getExtensions.js && \
    sed -e 's|.https://assets.terra.money/extensions.json.|process.env.REACT_APP_ASSETS ? `${process.env.REACT_APP_ASSETS}/extensions.json` : `https://assets.terra.money/extensions.json`|g' \
        -i /app/node_modules/@terra-money/wallet-controller/_commonjs/operators/getExtensions.js && \
    sed -e 's|.https://assets.terra.money/station/chains.json.|process.env.REACT_APP_ASSETS ? `${process.env.REACT_APP_ASSETS}/station/chains.json` : `https://assets.terra.money/station/chains.json`|g' \
        -i /app/node_modules/@terra-money/wallet-controller/getChainOptions.js && \
    sed -e 's|.https://assets.terra.money/station/chains.json.|process.env.REACT_APP_ASSETS ? `${process.env.REACT_APP_ASSETS}/station/chains.json` : `https://assets.terra.money/station/chains.json`|g' \
        -i /app/node_modules/@terra-money/wallet-controller/_commonjs/getChainOptions.js && \
    npm run build --openssl-legacy-provider

###############################################################################

FROM node:16-alpine

WORKDIR /app

COPY --from=builder /app/build .


RUN set -eux && \
    npm install -g serve

CMD ["serve", "-s", "."]
