import { useMemo } from "react"
import { LCDClient } from "@terra-money/terra.js"
import { LCDClient as InterchainLCDClient } from "@terra-money/station.js"
import { useNetwork } from "data/wallet"

export const useLCDClient = () => {
  const network = useNetwork()

  const lcdClient = useMemo(
    () => new LCDClient({ ...network, URL: network.lcd }),
    [network]
  )

  return lcdClient
}

// TODO: move to assets.terra.money
const DEFAULT_CHAINS = {
  "phoenix-1": {
    chainID: "phoenix-1",
    lcd: "https://phoenix-lcd.terra.dev",
    gasAdjustment: 1.75,
    gasPrices: { uluna: 0.015 },
    prefix: "terra",
  },
  "osmosis-1": {
    chainID: "osmosis-1",
    lcd: "https://lcd.osmosis.zone",
    gasAdjustment: 1.75,
    gasPrices: { uosmo: 0.015 },
    prefix: "osmo",
  },
}

export const useInterchainLCDClient = () => {
  const network = useNetwork()

  const lcdClient = useMemo(
    () => new InterchainLCDClient(DEFAULT_CHAINS),
    [network]
  )

  return lcdClient
}
