import { useTFMChains } from "data/external/multichainTfm"
import { getChainTokens, useRangoMeta } from "data/external/rango"
import { useNetwork } from "data/wallet"
import { PropsWithChildren, useMemo } from "react"
import createContext from "utils/createContext"

type SwapProvider = "legacyTfm" | "rango" | "tfm"

interface SwapChains {
  swapProvider: Record<string, SwapProvider>
}

export const [useSwapChains, SwapChainsProvider] =
  createContext<SwapChains>("useSwapChains")

export const SwapChainsContext = ({ children }: PropsWithChildren<{}>) => {
  const { data: rangoMeta } = useRangoMeta()
  const { data: tfmChains } = useTFMChains()
  const networks = useNetwork()

  const swapProvider = useMemo(() => {
    const result: Record<string, SwapProvider> = {}

    const stationChains = new Set(Object.keys(networks))

    if (rangoMeta) {
      rangoMeta.blockchains.forEach(({ chainId }) => {
        if (!chainId) return

        if (!stationChains.has(chainId)) return

        const tokens = getChainTokens(rangoMeta, chainId)
        if (tokens.length < 2) return

        result[chainId] = "rango"
      })
    }

    if (tfmChains) {
      tfmChains.forEach(({ chain_id }) => {
        if (stationChains.has(chain_id)) {
          result[chain_id] = "tfm"
        }
      })
    }

    // to make sure exchange on Terra is stable
    result["phoenix-1"] = "legacyTfm"

    return result
  }, [networks, rangoMeta, tfmChains])

  return (
    <SwapChainsProvider value={{ swapProvider }}>{children}</SwapChainsProvider>
  )
}
