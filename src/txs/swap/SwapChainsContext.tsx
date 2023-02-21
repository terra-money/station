import { useRangoMeta } from 'data/external/rango'
import { useNetwork } from 'data/wallet'
import { PropsWithChildren, useMemo } from 'react'
import createContext from 'utils/createContext'

type SwapProvider = 'tfm' | 'rango'

interface SwapChains {
  swapProvider: Record<string, SwapProvider>
}

export const [useSwapChains, SwapChainsProvider] =
  createContext<SwapChains>('useSwapChains')

export const SwapChainsContext = ({ children }: PropsWithChildren<{}>) => {
  const { data: rangoMeta } = useRangoMeta()
  const networks = useNetwork()

  const swapProvider = useMemo(() => {
    const result: Record<string, SwapProvider> = {
      'phoenix-1': 'tfm',
    }

    if (rangoMeta) {
      const rangoChainIds = new Set(
        rangoMeta.blockchains.map(({ chainId }) => chainId)
      )
      Object.keys(networks).forEach((chainId) => {
        if (rangoChainIds.has(chainId)) {
          result[chainId] = 'rango'
        }
      })
    }

    return result
  }, [networks, rangoMeta])

  return (
    <SwapChainsProvider value={{ swapProvider }}>{children}</SwapChainsProvider>
  )
}
