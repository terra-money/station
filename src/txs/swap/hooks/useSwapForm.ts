import { TFMToken } from "data/external/multichainTfm"
import { useForm, UseFormReturn } from "react-hook-form"

export interface SwapFormShape {
  slippage: number
  sourceChain: string
  destinationChain: string
  offerAsset: TFMToken
  askAsset: TFMToken
  amount: number
}

const defaultFormValues: Partial<SwapFormShape> = {
  slippage: 1,
  sourceChain: "phoenix-1",
  destinationChain: "osmosis-1",
}

export type SwapFormState = UseFormReturn<SwapFormShape>

export const useSwapForm = () => {
  return useForm<SwapFormShape>({
    mode: "onChange",
    defaultValues: defaultFormValues,
  })
}
