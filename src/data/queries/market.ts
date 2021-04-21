import { useQuery } from "react-query"
import { queryKey, RefetchOptions } from "../query"
import { useLCDClient } from "../Terra/lcdClient"

export const useMarketParams = () => {
  const lcd = useLCDClient()
  return useQuery([queryKey.market.params], () => lcd.market.parameters(), {
    ...RefetchOptions.INFINITY,
  })
}
