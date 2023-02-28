import { useTFMChains } from "data/external/multichainTfm"
import { getChainTokens, useRangoMeta } from "data/external/rango"
import { useNetwork } from "data/wallet"
import { PropsWithChildren, useMemo } from "react"
import createContext from "utils/createContext"

type SwapProvider = "rango" | "tfm"

interface SwapProviders {
  providers: Record<string, SwapProvider[]>
}

export const [useSwapProviders, SwapProvidersProvider] =
  createContext<SwapProviders>("useSwapProviders")

const unsupportedChains = ["osmosis-1"]

export const SwapProvidersContext = ({ children }: PropsWithChildren<{}>) => {
  const { data: rangoMeta } = useRangoMeta()
  const { data: tfmChains } = useTFMChains()
  const networks = useNetwork()

  const providers = useMemo(() => {
    const result: Record<string, SwapProvider[]> = {}
    const pushProvider = (chain: string, provider: SwapProvider) => {
      if (!result[chain]) {
        result[chain] = []
      }

      result[chain].push(provider)
    }

    const stationChains = new Set(Object.keys(networks))

    if (rangoMeta) {
      rangoMeta.blockchains.forEach(({ chainId }) => {
        if (!chainId) return

        if (!stationChains.has(chainId)) return

        const tokens = getChainTokens(rangoMeta, chainId)
        if (tokens.length < 2) return

        pushProvider(chainId, "rango")
      })
    }

    if (tfmChains) {
      tfmChains.forEach(({ chain_id }) => {
        if (stationChains.has(chain_id)) {
          pushProvider(chain_id, "tfm")
        }
      })
    }

    unsupportedChains.forEach((chainId) => {
      delete result[chainId]
    })

    return result
  }, [networks, rangoMeta, tfmChains])

  return (
    <SwapProvidersProvider value={{ providers }}>
      {children}
    </SwapProvidersProvider>
  )
}
