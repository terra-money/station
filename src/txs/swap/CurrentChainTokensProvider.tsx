import { useTFMTokens } from "data/external/multichainTfm"
import { getChainTokens, useRangoMeta } from "data/external/rango"
import { PropsWithChildren } from "react"
import createContext from "utils/createContext"
import getRecord from "utils/getRecord"
import { useCurrentChain } from "./CurrentChainProvider"

export interface SwapToken {
  name: string
  symbol: string
  address: string | null
  decimals: number
  icon?: string
}

interface SwapChains {
  tokens: SwapToken[]
  tokensRecord: Record<string, SwapToken>
}

export const getTokenId = (token: SwapToken) => token.address || token.symbol

export const [useCurrentChainTokens, CurrentChainsTokensProvider] =
  createContext<SwapChains>("useCurrentChainTokens")

export const RangoCurrentChainTokensProvider = ({
  children,
}: PropsWithChildren<{}>) => {
  const chainID = useCurrentChain()
  const { data: rangoMeta } = useRangoMeta()

  const rangoTokens = rangoMeta ? getChainTokens(rangoMeta, chainID) : []
  const tokens: SwapToken[] = rangoTokens.map((token) => ({
    name: token.name,
    symbol: token.symbol,
    address: token.address,
    decimals: token.decimals,
    icon: token.image,
  }))
  const tokensRecord = getRecord(tokens, getTokenId)

  return (
    <CurrentChainsTokensProvider value={{ tokens, tokensRecord }}>
      {children}
    </CurrentChainsTokensProvider>
  )
}

export const TFMCurrentChainTokensProvider = ({
  children,
}: PropsWithChildren<{}>) => {
  const chainID = useCurrentChain()
  const { data: tfmTokens } = useTFMTokens(chainID)

  const tokens: SwapToken[] = tfmTokens
    ? tfmTokens.map((token) => ({
        name: token.name,
        symbol: token.symbol,
        address: token.contract_addr,
        decimals: token.decimals,
      }))
    : []
  const tokensRecord = getRecord(tokens, getTokenId)

  if (!tokens.length) return null

  return (
    <CurrentChainsTokensProvider value={{ tokens, tokensRecord }}>
      {children}
    </CurrentChainsTokensProvider>
  )
}
