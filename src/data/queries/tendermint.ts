import { useQuery } from "react-query"
import axios from "axios"
import { queryKey, RefetchOptions } from "../query"
import { useNetworks } from "app/InitNetworks"

export const useLocalNodeInfo = (chainID: string) => {
  const { networks } = useNetworks()
  return useQuery(
    [queryKey.tendermint.nodeInfo],
    async () => {
      const { data } = await axios.get(
        "cosmos/base/tendermint/v1beta1/node_info",
        {
          baseURL: networks[chainID][chainID].lcd,
        }
      )
      return data
    },
    { ...RefetchOptions.INFINITY, enabled: chainID === "localterra" }
  )
}
