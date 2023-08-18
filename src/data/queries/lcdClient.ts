import { useMemo } from "react"
import { LCDClient as InterchainLCDClient } from "@terra-money/feather.js"
import { LCDClient } from "@terra-money/terra.js"
import { useChainID, useNetwork } from "data/wallet"
import { ChainID, InterchainNetwork } from "types/network"

export const useInterchainLCDClient = () => {
  const network = useNetwork()
  const lcdClient = useMemo(() => new InterchainLCDClient(network), [network])
  return lcdClient
}

export const useInterchainLCDClientGovOverride = () => {
  const network = useNetwork()
  const networksWithVersion = Object.fromEntries(
    Object.entries(network as Record<ChainID, InterchainNetwork>).map(
      ([key, value]) => {
        if (key === "phoenix-1") {
          return [
            key,
            {
              ...value,
              lcd: "https://terra-api.polkachu.com/",
            },
          ]
        }
        return [key, value]
      }
    )
  )
  const lcdClient = useMemo(
    () => new InterchainLCDClient(networksWithVersion),
    [networksWithVersion]
  )
  return lcdClient
}

export const useLCDClient = () => {
  const network = useNetwork()
  const chainID = useChainID()

  const lcdClient = useMemo(
    () => new LCDClient({ ...network[chainID], URL: network[chainID].lcd }),
    [network, chainID]
  )

  return lcdClient
}
