import { useQuery } from "react-query"
import { SwapFormShape } from "./useSwapForm"

export const useSwap = ({
  slippage,
  offerAsset,
  askAsset,
  amount,
}: SwapFormShape) => {
  return useQuery(
    ["Swap", slippage, offerAsset, askAsset, amount],
    () => {
      // const quote = await rangoCli
    },
    {
      enabled: Boolean(slippage && offerAsset && askAsset && amount),
    }
  )
}
