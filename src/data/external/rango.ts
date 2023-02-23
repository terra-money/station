import { RefetchOptions } from "data/query"
import { useQuery } from "react-query"
import { QuoteRequest, RangoClient, SwapRequest } from "rango-sdk-basic"
import { assertDefined } from "utils/assertDefined"

// TODO: get api key from env var
// const RANGO_API_KEY = "c6381a79-2817-4602-83bf-6a641a409e32"
const RANGO_API_KEY = "93f4efaa-caab-4458-97d8-196faadb7923"

export const rangoClient = new RangoClient(RANGO_API_KEY)
/*
{
    "apiKey":"93f4efaa-caab-4458-97d8-196faadb7923",
    "rateLimitPerSecond": 5,
    "title": "TerraStation",
    "allowedDomains": [
        "http://localhost:3000"
    ]
}
*/

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
