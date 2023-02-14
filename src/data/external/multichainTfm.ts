import axios from "axios"
import { RefetchOptions } from "data/query"
import { useQuery } from "react-query"

export interface TFMChain {
  chain_id: string
  type: string
  name: string
  id: 2
}

const baseURL = "https://multichain.api.tfm.com/"

export const queryTFMTokens = async () => {
  const { data } = await axios.get<TFMChain[]>("/chains", { baseURL })
  return data
}

export const useTFMChains = () => {
  return useQuery("Multichain TFM chains", queryTFMTokens, {
    ...RefetchOptions.INFINITY,
  })
}
