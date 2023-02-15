import axios from "axios"
import { RefetchOptions } from "data/query"
import { useQuery } from "react-query"

export interface TFMChain {
  chain_id: string
  type: string
  name: string
  image_url: string
  id: 2
}

export interface TFMToken {
  name: string
  symbol: string
  contract_addr: string
  decimals: number
}

const baseURL = "https://multichain.api.tfm.com/"

export const queryTFMChains = async () => {
  const { data } = await axios.get<TFMChain[]>("/chains?network_type=mainnet", {
    baseURL,
  })
  return data
}

export const useTFMChains = () => {
  return useQuery("Multichain TFM chains", queryTFMChains, {
    ...RefetchOptions.INFINITY,
  })
}

export const useTFMTokens = (chainId: string) => {
  return useQuery(
    `Multichain TFM tokens for ${chainId}`,
    async () => {
      const { data } = await axios.get<TFMToken[]>(
        `/tokens?chain_id=${chainId}`,
        { baseURL }
      )
      return data
    },
    {
      ...RefetchOptions.INFINITY,
    }
  )
}

export interface TFMRouteParams {
  token0: string
  chain0: string
  token1: string
  chain1: string
  amount: string
  exchange?: string
}

interface TFMRouteResult {
  input_amount: number
  return_amount: number
  source_chain_id: string
  destination_chain_id: string
  source_chain_name: string
  destination_chain_name: string
  alternatives: any
  price_impact: number
  routes: any[]
}

export const queryTFMRoute = async (params: TFMRouteParams) => {
  const { data } = await axios.get<TFMRouteResult>("/route/cross", {
    baseURL,
    params,
  })
  return data
}

export interface TFMSwapParams extends TFMRouteParams {
  slippage?: string
}

interface TFMSwapResult {
  type: string
  chainID: string
  chainName: string
  msg: any[]
}

interface TFMSwapFailed {
  message: string
  success: false
}

export const queryTFMSwap = async (params: TFMSwapParams) => {
  const { data } = await axios.get<TFMSwapResult[] | TFMSwapFailed>(
    "/swap/cross",
    {
      baseURL,
      params,
    }
  )

  return data
}
