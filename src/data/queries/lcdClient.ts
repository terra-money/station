import { useMemo } from "react"
import { LCDClient } from "@terra-money/terra.js"
import { useNetwork } from "data/wallet"

export const useLCDClient = () => {
  const network = useNetwork()
  const lcdClient = useMemo(
    () => new LCDClient({ ...network, URL: network.lcd }),
    [network]
  )

  return lcdClient
}
