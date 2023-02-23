import { useMemo } from "react"
import { useForm, UseFormReturn } from "react-hook-form"
import { getTokenId, useCurrentChainTokens } from "../CurrentChainTokensContext"

export interface SwapFormShape {
  slippage: number
  offerAsset: string
  askAsset: string
  amount: number
}

export type SwapFormState = UseFormReturn<SwapFormShape>

export const useSwapForm = () => {
  const { tokens } = useCurrentChainTokens()

  const defaultOfferAsset = useMemo(() => {
    if (!tokens.length) return undefined

    return getTokenId(tokens.find((token) => !token.address) || tokens[0])
  }, [tokens])

  return useForm<SwapFormShape>({
    mode: "onChange",
    defaultValues: {
      slippage: 1,
      offerAsset: defaultOfferAsset,
    },
  })
}
