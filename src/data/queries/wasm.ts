import { useQueries, useQuery } from "react-query"
import axios from "axios"
import { AccAddress } from "@terra-money/feather.js"
import { queryKey, RefetchOptions } from "../query"
import { useNetwork } from "../wallet"
import { useInterchainLCDClient } from "./lcdClient"
import { useInterchainAddresses } from "auth/hooks/useAddress"
import { getChainIDFromAddress } from "utils/bech32"

/* contract info */
export const useContractInfo = (address: TerraAddress) => {
  const lcd = useInterchainLCDClient()
  return useQuery(
    [queryKey.wasm.contractInfo, address],
    () => lcd.wasm.contractInfo(address),
    { ...RefetchOptions.INFINITY, enabled: AccAddress.validate(address) }
  )
}

export const useInitMsg = <T>(address: TerraAddress) => {
  const lcd = useInterchainLCDClient()
  return useQuery<T>(
    [queryKey.wasm.contractInfo, "initMsg", address],
    async () => {
      const d = await lcd.wasm.contractInfo(address)
      return d.init_msg
    },
    { ...RefetchOptions.INFINITY, enabled: AccAddress.validate(address) }
  )
}

/* contract query */
export const useGetContractQuery = () => {
  const lcd = useInterchainLCDClient()

  return <T>(contract?: AccAddress, query?: object) => ({
    queryKey: [queryKey.wasm.contractQuery, contract, query],
    queryFn: async () => {
      if (!(contract && query)) return
      return await lcd.wasm.contractQuery<T>(contract, query)
    },
    enabled: !!contract && AccAddress.validate(contract),
  })
}

export const useContractQuery = <T>(contract?: AccAddress, query?: object) => {
  const getQuery = useGetContractQuery()
  return useQuery(getQuery<T>(contract, query))
}

/* token info */
export const useTokenInfoCW20 = (token: TerraAddress, enabled = true) => {
  const getQuery = useGetContractQuery()
  return useQuery({
    ...getQuery<CW20TokenInfoResponse>(token, { token_info: {} }),
    ...RefetchOptions.INFINITY,
    enabled: AccAddress.validate(token) && enabled,
  })
}

export const useTokenInfoCW721 = (contract: AccAddress, token_id: string) => {
  const lcd = useInterchainLCDClient()

  return useQuery(
    [queryKey.wasm.contractQuery, contract, token_id],
    async () => {
      const data = await lcd.wasm.contractQuery<NFTTokenItem>(contract, {
        nft_info: { token_id },
      })

      const { token_uri } = data
      const uri = getIpfsGateway(token_uri)
      if (!token_uri || !uri) return data

      try {
        const { data: extension } = await axios.get(uri)
        return { ...data, extension: { ...data.extension, ...extension } }
      } catch {
        return data
      }
    },
    { ...RefetchOptions.INFINITY }
  )
}

/* token balance */
const useGetTokenBalanceQuery = () => {
  const addresses = useInterchainAddresses()
  const lcd = useInterchainLCDClient()
  const network = useNetwork()

  return (token: AccAddress) => ({
    queryKey: [queryKey.wasm.contractQuery, token, { balance: addresses }],
    queryFn: async () => {
      const chainID = getChainIDFromAddress(token, network)
      if (!addresses || !addresses[chainID ?? ""]) return "0"
      const { balance } = await lcd.wasm.contractQuery<{ balance: Amount }>(
        token,
        { balance: { address: addresses[chainID ?? ""] } }
      )

      return balance
    },
    ...RefetchOptions.DEFAULT,
    retry: false, // Tokens that are not implemented fail to get the balance.
    enabled: AccAddress.validate(token),
  })
}

export const useTokenBalance = (token: AccAddress) => {
  const getQuery = useGetTokenBalanceQuery()
  return useQuery(getQuery(token))
}

export const useTokenBalances = (tokens: AccAddress[]) => {
  const getQuery = useGetTokenBalanceQuery()
  return useQueries(tokens.map(getQuery))
}

export const useCW721Tokens = (contract: AccAddress) => {
  const addresses = useInterchainAddresses()
  const getQuery = useGetContractQuery()
  const chainID = getChainIDFromAddress(contract, useNetwork())

  return useQuery(
    getQuery<{ tokens: string[] }>(contract, {
      tokens: { owner: addresses?.[chainID ?? ""] },
    })
  )
}

/* helpers */
export const getIpfsGateway = (src: any = "") => {
  if (typeof src === "string") {
    return src.startsWith("ipfs://")
      ? src.replace("ipfs://", "https://cloudflare-ipfs.com/ipfs/")
      : src.startsWith("https://") || src.startsWith("data:")
      ? src
      : undefined
  } else {
    return
  }
}
