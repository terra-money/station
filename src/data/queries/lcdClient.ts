import { useMemo } from "react"
import { LCDClient } from "@terra-money/terra.js"
import { useNetwork } from "data/wallet"
import { useIsClassic } from "data/query"

export const useLCDClient = () => {
  const network = useNetwork()
  const isClassic = useIsClassic()

  const lcdClient = useMemo(
    () => new LCDClient({ ...network, URL: network.lcd, isClassic }),
    [network, isClassic]
  )

  return lcdClient
}
