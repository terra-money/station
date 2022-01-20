import { useQuery } from "react-query"
import { queryKey, RefetchOptions } from "../query"
import { useLCDClient } from "./lcdClient"

export const useNodeInfo = () => {
  const lcd = useLCDClient()

  return useQuery(
    [queryKey.tendermint.nodeInfo],
    () => lcd.tendermint.nodeInfo(),
    { ...RefetchOptions.INFINITY }
  )
}
