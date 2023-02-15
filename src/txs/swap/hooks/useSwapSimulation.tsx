import {
  queryTFMRoute,
  queryTFMSwap,
  TFMRouteParams,
} from "data/external/multichainTfm"
import { useQuery } from "react-query"
import { SwapFormState } from "./useSwapForm"
import BigNumber from "bignumber.js"
import { toAmount } from "@terra.kitchen/utils"

const toTFMAmount = (amount: number, decimals: number) => {
  return new BigNumber(amount)
    .multipliedBy(Math.pow(10, decimals))
    .toFixed()
    .toString()
}

const toTFMSlippage = (value: number) =>
  new BigNumber(value!).div(100).toString()

export const useSwapSimulation = ({
  watch,
  formState: { isValid },
}: SwapFormState) => {
  const values = watch()

  const {
    offerAsset,
    askAsset,
    sourceChain,
    destinationChain,
    amount,
    slippage,
  } = values

  return useQuery(
    ["TFM.simulate.swap", values],
    async () => {
      const routeParams: TFMRouteParams = {
        chain0: sourceChain,
        chain1: destinationChain,
        token0: offerAsset.contract_addr,
        token1: askAsset.contract_addr,
        amount: toTFMAmount(amount, offerAsset.decimals),
      }
      const route = await queryTFMRoute(routeParams)
      const swap = await queryTFMSwap({
        ...routeParams,
        slippage: toTFMSlippage(slippage),
      })

      const simulatedAmount = toAmount(route.return_amount, {
        decimals: askAsset.decimals,
      })

      return { route, swap, simulatedAmount } as const
    },
    { enabled: !!(isValid && askAsset && offerAsset) }
  )
}
