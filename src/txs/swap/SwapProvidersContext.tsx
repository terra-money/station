import { useTFMChains } from "data/external/multichainTfm"
import { getChainTokens, useRangoMeta } from "data/external/rango"
import { useNetwork, useNetworkName } from "data/wallet"
import { PropsWithChildren, useMemo } from "react"
import createContext from "utils/createContext"

type SwapProvider = "rango" | "tfm"

interface SwapProviders {
  providers: Record<string, SwapProvider[]>
}

export const [useSwapProviders, SwapProvidersProvider] =
  createContext<SwapProviders>("useSwapProviders")

const supportedChainsByNetwork: Record<string, string[]> = {
  mainnet: ["juno-1", "phoenix-1", "kaiyo-1"],
  classic: ["columbus-5"],
}

export const SwapProvidersContext = ({ children }: PropsWithChildren<{}>) => {
  const { data: rangoMeta } = useRangoMeta()
  const { data: tfmChains } = useTFMChains()
  const networks = useNetwork()
  const networkName = useNetworkName()

  const supportedChains = useMemo(() => {
    const supportedChainsOnNetwork = supportedChainsByNetwork[networkName]
    if (!supportedChainsOnNetwork) return []

    return supportedChainsOnNetwork.filter((chainId) => networks[chainId])
  }, [networkName, networks])

  const providers = useMemo(() => {
    const result: Record<string, SwapProvider[]> = {}
    const pushProvider = (chain: string, provider: SwapProvider) => {
      if (!result[chain]) {
        result[chain] = []
      }

      result[chain].push(provider)
    }

    const stationChains = new Set(supportedChains)

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

    return result
  }, [rangoMeta, supportedChains, tfmChains])

  if (Object.keys(providers).length === 0) {
    return <p>Swap is not available for this network</p>
  }

  return (
    <SwapProvidersProvider value={{ providers }}>
      {children}
    </SwapProvidersProvider>
  )
}
