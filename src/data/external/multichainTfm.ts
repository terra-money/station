import axios from "axios"
import { RefetchOptions } from "data/query"
import { useQuery } from "react-query"

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
