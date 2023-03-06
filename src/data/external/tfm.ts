import { useQuery } from "react-query"
import axios from "axios"
import { RefetchOptions } from "data/query"

const baseURL = "https://api-terra2.tfm.com"
export const TFM_ROUTER =
  "terra19hz374h6ruwtzrnm8ytkae782uv79h9yt9tuytgvt94t26c4793qnfg7vn"

interface TFMTokenItem {
  contract_addr: string
  decimals: number
  id: number
  name: string
  symbol: string
  is_token_liquid: boolean
}

export const queryTFMTokens = async () => {
  const { data } = await axios.get<TFMTokenItem[]>("/tokens", { baseURL })
  return data.filter(({ is_token_liquid }) => is_token_liquid)
}

interface TFMRouteParams {
  token0: string
  token1: string
  amount: string
  exchange?: string
  use_split: boolean
}

interface TFMRouteResult {
  alternatives: any
  input_amount: number
  price_impact: number
  return_amount: number
  routes: any[]
}

export const queryTFMRoute = async (params: TFMRouteParams) => {
  const { data } = await axios.get<TFMRouteResult>("/route", {
    baseURL,
    params,
  })
  return data
}

interface TFMSwapParams extends TFMRouteParams {
  slippage?: string
}

interface TFMSwapResult {
  type: string
  value: {
    coins: { amount: string; denom: string }[]
    contract: string
    execute_msg: object
    sender: string
  }
}

interface TFMSwapFailed {
  message: string
  success: false
}

export const queryTFMSwap = async (params: TFMSwapParams) => {
  const { data } = await axios.get<TFMSwapResult | TFMSwapFailed>("/swap", {
    baseURL,
    params,
  })

  return data
}

export const useTFMTokens = () => {
  return useQuery("TFM Tokens", queryTFMTokens, { ...RefetchOptions.INFINITY })
}
