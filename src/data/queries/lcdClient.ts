import { useMemo } from "react"
import { LCDClient } from "@terra-money/terra.js"
import { LCDClient as InterchainLCDClient } from "@terra-money/feather.js"
import { useNetwork } from "data/wallet"
import { useChains } from "./chains"

export const useLCDClient = () => {
  const network = useNetwork()

  const lcdClient = useMemo(
    () => new LCDClient({ ...network, URL: network.lcd }),
    [network]
  )

  return lcdClient
}

export const useInterchainLCDClient = () => {
  const network = useNetwork()
  const chains = useChains(network.name === "testnet" ? "testnet" : "mainnet")

  const lcdClient = useMemo(
    () => new InterchainLCDClient(chains as any),
    [chains]
  )

  return lcdClient
}
