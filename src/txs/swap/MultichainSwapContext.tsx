import { TFMChain, useTFMChains } from "data/external/multichainTfm"
import { PropsWithChildren } from "react"
import createContext from "utils/createContext"

interface MultichainSwap {
  chains: TFMChain[]
}

export const [useMultichainSwap, MultichainSwapProvider] =
  createContext<MultichainSwap>("useMultichainSwap")

export const MultichainSwapContext = ({ children }: PropsWithChildren<{}>) => {
  const { data } = useTFMChains()

  if (!data) return null

  return (
    <MultichainSwapProvider value={{ chains: data }}>
      {children}
    </MultichainSwapProvider>
  )
}
