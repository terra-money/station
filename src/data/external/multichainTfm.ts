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
