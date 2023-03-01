import { RefetchOptions } from "data/query"
import { useQuery } from "react-query"
import {
  MetaResponse,
  QuoteRequest,
  RangoClient,
  SwapRequest,
} from "rango-sdk-basic"
import { assertDefined } from "utils/assertDefined"

const RANGO_API_KEY = "93f4efaa-caab-4458-97d8-196faadb7923"

export const rangoClient = new RangoClient(RANGO_API_KEY)

export const useRangoMeta = () => {
  return useQuery(
    "Rango meta",
    () => rangoClient.meta(),
    RefetchOptions.INFINITY
  )
}

export const useRangoQuote = (quoteRequest?: QuoteRequest) => {
  return useQuery(
    ["Rango quote", quoteRequest],
    () => rangoClient.quote(assertDefined(quoteRequest)),
    {
      enabled: !!quoteRequest,
    }
  )
}

export const useRangoSwap = (swapRequest?: SwapRequest) => {
  return useQuery(
    ["Rango swap", swapRequest],
    () => rangoClient.swap(assertDefined(swapRequest)),
    {
      enabled: !!swapRequest,
    }
  )
}

export interface RangoFund {
  denom: string
  amount: string
}

export interface RangoMsgExecuteContract {
  sender: string
  contract: string
  msg: string
  funds: RangoFund[]
}

type RangoMsgType = "MsgExecuteContract"

export interface RangoMsg {
  typeUrl: string
  __type: RangoMsgType
  value: RangoMsgExecuteContract
}

export const getChainTokens = ({ tokens }: MetaResponse, chain: string) =>
  tokens.filter((token) => token.chainId === chain)
