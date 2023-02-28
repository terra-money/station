import { useNetwork } from "data/wallet"
import { useMemo } from "react"
import { useForm, UseFormReturn } from "react-hook-form"
import { useCurrentChain } from "../CurrentChainProvider"
import {
  getTokenId,
  useCurrentChainTokens,
} from "../CurrentChainTokensProvider"

export interface SwapFormShape {
  slippage: number
  offerAsset: string
  askAsset: string
  amount: number
}

export type SwapFormState = UseFormReturn<SwapFormShape>

export const useSwapForm = () => {
  const { tokens } = useCurrentChainTokens()
  const networks = useNetwork()
  const chain = useCurrentChain()

  const defaultOfferAsset = useMemo(() => {
    if (!tokens.length) return undefined

    const primaryAssets = new Set(Object.keys(networks[chain].gasPrices))

    const token =
      tokens.find((token) => primaryAssets.has(getTokenId(token))) || tokens[0]

    return getTokenId(token)
  }, [chain, networks, tokens])

  return useForm<SwapFormShape>({
    mode: "onChange",
    defaultValues: {
      slippage: 1,
      offerAsset: defaultOfferAsset,
    },
  })
}
