import { useQuery } from "react-query"
import axios from "axios"
import { queryKey, RefetchOptions } from "../query"
import { useNetwork } from "data/wallet"

export const useNodeInfo = (chainID: string) => {
  const networks = useNetwork()

  return useQuery(
    [queryKey.tendermint.nodeInfo],
    async () => {
      const { data } = await axios.get("node_info", {
        baseURL: networks[chainID]?.lcd,
      })
      return data
    },
    { ...RefetchOptions.INFINITY }
  )
}
