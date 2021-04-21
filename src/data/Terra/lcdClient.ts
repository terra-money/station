import { useMemo } from "react"
import { LCDClient } from "@terra-money/terra.js"
import { useWallet } from "@terra-money/wallet-provider"

export const useLCDClient = () => {
  const { network } = useWallet()
  const lcdClient = useMemo(
    () => new LCDClient({ ...network, URL: network.lcd }),
    [network]
  )

  return lcdClient
}
