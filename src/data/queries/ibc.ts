import { useQuery } from "react-query"
import { isDenomIBC } from "@terra.kitchen/utils"
import { queryKey, RefetchOptions } from "../query"
import { useInterchainLCDClient } from "./lcdClient"

export const useIBCBaseDenom = (
  denom: Denom,
  chainID: string,
  enabled: boolean
) => {
  const lcd = useInterchainLCDClient()

  return useQuery(
    [queryKey.ibc.denomTrace, denom],
    async () => {
      const { base_denom } = await lcd.ibcTransfer.denomTrace(
        denom.replace("ibc/", ""),
        chainID
      )

      return base_denom
    },
    { ...RefetchOptions.INFINITY, enabled: isDenomIBC(denom) && enabled }
  )
}
