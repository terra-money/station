import { useMemo } from "react"
import { LCDClient } from "@terra-money/terra.js"
import { LCDClient as InterchainLCDClient } from "@terra-money/feather.js"
import { useNetwork, useNetworkName } from "data/wallet"

export const useLCDClient = () => {
  const network = useNetworkName()

  const lcdClient = useMemo(
    () =>
      new LCDClient(
        network === "mainnet"
          ? {
              chainID: "phoenix-1",
              URL: "https://phoenix-lcd.terra.dev",
              gasAdjustment: 1.75,
              gasPrices: { uluna: 0.015 },
            }
          : {
              chainID: "pisco-1",
              URL: "https://pisco-lcd.terra.dev",
              gasAdjustment: 1.75,
              gasPrices: { uluna: 0.015 },
            }
      ),
    [network]
  )

  return lcdClient
}

export const useInterchainLCDClient = () => {
  const network = useNetwork()

  const lcdClient = useMemo(() => new InterchainLCDClient(network), [network])

  return lcdClient
}
