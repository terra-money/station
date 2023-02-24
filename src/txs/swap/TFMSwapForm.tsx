import { useCurrentChainTokens } from "./CurrentChainTokensProvider"

export const TFMSwapForm = () => {
  const tokens = useCurrentChainTokens()

  return (
    <>
      <p>TFM Swap coming soon!</p>
      <p>Tokens: {JSON.stringify(tokens, undefined, 2)}</p>
    </>
  )
}
