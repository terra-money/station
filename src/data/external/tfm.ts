import { useQuery } from "react-query"
import axios from "axios"
import { RefetchOptions } from "data/query"

const baseURL = "https://terra2-routing-api.tfm.dev"
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

export const useTFMTokens = () => {
  return useQuery("TFM Tokens", queryTFMTokens, { ...RefetchOptions.INFINITY })
}
