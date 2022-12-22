import { useMemo } from "react"
import { LCDClient } from "@terra-money/terra.js"
import { LCDClient as InterchainLCDClient } from "@terra-money/feather.js"
import { useNetworkName } from "data/wallet"
import { useNetworks } from "app/InitNetworks"

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
  const network = useNetworkName()
  const { networks, filterEnabledNetworks } = useNetworks()

  const lcdClient = useMemo(
    () => new InterchainLCDClient(filterEnabledNetworks(networks[network])),
    [networks, network, filterEnabledNetworks]
  )

  return lcdClient
}
