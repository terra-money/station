import { useMemo } from "react"
import { LCDClient as InterchainLCDClient } from "@terra-money/feather.js"
import { useNetwork } from "data/wallet"

export const useInterchainLCDClient = () => {
  const network = useNetwork()

  const lcdClient = useMemo(() => new InterchainLCDClient(network), [network])

  return lcdClient
}
