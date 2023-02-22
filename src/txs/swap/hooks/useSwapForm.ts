import { useForm, UseFormReturn } from "react-hook-form"

export interface SwapFormShape {
  slippage: number
  offerAsset: string
  askAsset: string
  amount: number
}

const defaultFormValues: Partial<SwapFormShape> = {
  slippage: 1,
}

export type SwapFormState = UseFormReturn<SwapFormShape>

export const useSwapForm = () => {
  return useForm<SwapFormShape>({
    mode: "onChange",
    defaultValues: defaultFormValues,
  })
}
