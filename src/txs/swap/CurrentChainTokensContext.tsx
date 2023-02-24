import { getChainTokens, useRangoMeta } from "data/external/rango"
import { Token } from "rango-sdk-basic"
import { PropsWithChildren } from "react"
import createContext from "utils/createContext"
import getRecord from "utils/getRecord"
import { useCurrentChain } from "./CurrentChainProvider"

export type SwapToken = Token

interface SwapChains {
  tokens: SwapToken[]
  tokensRecord: Record<string, SwapToken>
}

export const getTokenId = (token: SwapToken) => token.address || token.symbol

export const [useCurrentChainTokens, CurrentChainsTokensProvider] =
  createContext<SwapChains>("useCurrentChainTokens")

export const CurrentChainTokensContext = ({
  children,
}: PropsWithChildren<{}>) => {
  const chainID = useCurrentChain()
  const { data: rangoMeta } = useRangoMeta()

  const tokens = rangoMeta ? getChainTokens(rangoMeta, chainID) : []
  const tokensRecord = getRecord(tokens, getTokenId)

  return (
    <CurrentChainsTokensProvider value={{ tokens, tokensRecord }}>
      {children}
    </CurrentChainsTokensProvider>
  )
}
