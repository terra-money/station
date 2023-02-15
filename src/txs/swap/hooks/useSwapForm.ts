import { useForm, UseFormReturn } from "react-hook-form"

interface SwapFormAsset {
  chain: string
  asset: string
}

export interface SwapFormShape {
  slippage: number
  offerAsset: SwapFormAsset
  askAsset: SwapFormAsset
  amount: number
}

const defaultFormValues: Partial<SwapFormShape> = {
  slippage: 1,
  offerAsset: {
    chain: "phoenix-1",
    asset: "uluna",
  },
  askAsset: {
    chain: "osmosis-1",
    asset: "uosmo",
  },
}

export type SwapFormState = UseFormReturn<SwapFormShape>

export const useSwapForm = () => {
  return useForm<SwapFormShape>({
    mode: "onChange",
    defaultValues: defaultFormValues,
  })
}
