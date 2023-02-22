import { useCurrentChain } from "./CurrentChainProvider"

export const RangoSwapForm = () => {
  const chainID = useCurrentChain()
  return <p>Rango swap on {chainID} will be here</p>
}
