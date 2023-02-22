import { useRangoMeta } from "data/external/rango"
import { Token } from "rango-sdk-basic"
import { PropsWithChildren, useMemo } from "react"
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

  const tokens = useMemo(
    () =>
      (rangoMeta ? rangoMeta.tokens : []).filter(
        (token) => token.chainId === chainID
      ),
    [chainID, rangoMeta]
  )
  const tokensRecord = getRecord(tokens, getTokenId)

  return (
    <CurrentChainsTokensProvider value={{ tokens, tokensRecord }}>
      {children}
    </CurrentChainsTokensProvider>
  )
}
