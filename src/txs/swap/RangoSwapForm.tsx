import { useCurrentChainTokens } from "./CurrentChainTokensContext"

export const RangoSwapForm = () => {
  const { tokensRecord } = useCurrentChainTokens()

  return (
    <>
      <p>Tokens: {JSON.stringify(tokensRecord, null, 2)}</p>
    </>
  )
}
