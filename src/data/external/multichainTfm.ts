import axios from "axios"
import { RefetchOptions } from "data/query"
import { useQuery } from "react-query"
import { assertDefined } from "utils/assertDefined"

const baseURL = "https://multichain.api.tfm.com/"

export interface TFMChain {
  chain_id: string
  type: string
  name: string
  image_url: string
  id: number
  is_trading: boolean
}

export const queryTFMChains = async () => {
  const { data } = await axios.get<TFMChain[]>("/chains?network_type=mainnet", {
    baseURL,
  })
  return data.filter((chain) => chain.is_trading)
}

export const useTFMChains = () => {
  return useQuery("TFM chains", queryTFMChains, RefetchOptions.INFINITY)
}

export interface TFMToken {
  name: string
  symbol: string
  contract_addr: string
  decimals: number
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
    RefetchOptions.INFINITY
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

const queryTFMRoute = async (params: TFMRouteParams) => {
  const { data } = await axios.get<TFMRouteResult>("/route", {
    baseURL,
    params,
  })
  return data
}

export const useTFMRoute = (params?: TFMRouteParams) => {
  return useQuery(
    ["Rango quote", params],
    () => queryTFMRoute(assertDefined(params)),
    {
      enabled: !!params,
    }
  )
}

export interface TFMSwapParams extends TFMRouteParams {
  slippage?: string
}

interface TFMSwapCoin {
  denom: string
  amount: string
}

type TFMSwapTypeUrl = "/cosmwasm.wasm.v1.MsgExecuteContract"

interface TFMSwapResult {
  typeUrl: TFMSwapTypeUrl
  value: {
    coins: TFMSwapCoin[]
    contract: string
    execute_msg: any
  }
}

export const queryTFMSwap = async (params: TFMSwapParams) => {
  const { data } = await axios.get<TFMSwapResult>("/swap", {
    baseURL,
    params,
  })

  return data
}

export const useTFMSwap = (params?: TFMSwapParams) => {
  return useQuery(
    ["TFM swap", params],
    () => queryTFMSwap(assertDefined(params)),
    {
      enabled: !!params,
    }
  )
}
