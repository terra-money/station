import { TFMChain, useTFMChains } from "data/external/multichainTfm"
import { PropsWithChildren } from "react"
import createContext from "utils/createContext"
import getRecord from "utils/getRecord"

interface MultichainSwap {
  chains: TFMChain[]
  chainsRecord: Record<string, TFMChain>
}

export const [useMultichainSwap, MultichainSwapProvider] =
  createContext<MultichainSwap>("useMultichainSwap")

export const MultichainSwapContext = ({ children }: PropsWithChildren<{}>) => {
  const { data } = useTFMChains()

  if (!data) return null

  const value: MultichainSwap = {
    chains: data,
    chainsRecord: getRecord(data, (chain) => chain.chain_id),
  }

  return (
    <MultichainSwapProvider value={value}>{children}</MultichainSwapProvider>
  )
}
