import { useQuery } from "react-query"
import { queryKey, RefetchOptions } from "../query"
import { useInterchainLCDClient } from "./lcdClient"
import { AllianceAsset } from "@terra-money/feather.js/dist/client/lcd/api/AllianceAPI"

export const useAlliances = (chainID: string) => {
  const lcd = useInterchainLCDClient()

  return useQuery(
    [queryKey.alliance.alliances, chainID],
    async () => {
      const { alliances } = await lcd.alliance.alliances(chainID)
      return alliances as AllianceAsset[]
    },
    { ...RefetchOptions.DEFAULT }
  )
}
