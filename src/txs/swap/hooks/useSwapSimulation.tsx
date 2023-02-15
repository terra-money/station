import {
  queryTFMRoute,
  queryTFMSwap,
  TFMRouteParams,
  useTFMTokens,
} from "data/external/multichainTfm"
import { useQuery } from "react-query"
import { SwapFormState } from "./useSwapForm"
import BigNumber from "bignumber.js"
import getRecord from "utils/getRecord"

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

  const { offerAsset, askAsset, amount, slippage } = values

  const { data: tokens = [] } = useTFMTokens(offerAsset.chain)

  return useQuery(
    ["TFM.simulate.swap", values],
    async () => {
      const tokensRecord = getRecord(tokens, (t) => t.contract_addr)
      const { decimals } = tokensRecord[offerAsset.asset]
      const routeParams: TFMRouteParams = {
        chain0: offerAsset.chain,
        chain1: askAsset.chain,
        token0: offerAsset.asset,
        token1: askAsset.asset,
        amount: toTFMAmount(amount, decimals),
      }
      const route = await queryTFMRoute(routeParams)
      const swap = await queryTFMSwap({
        ...routeParams,
        slippage: toTFMSlippage(slippage),
      })
      return { route, swap } as const
    },
    { enabled: isValid && tokens.length > 0 }
  )
}
