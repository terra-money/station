import { useCallback } from "react"

export function useMetamaskProvider() {
  const getMetamaskProvider = useCallback(() => {
    const providerMap = window.ethereum.providerMap
    return providerMap.get("MetaMask")
  }, [])
  const matamaskProvider = !window.ethereum.providers
    ? window.ethereum
    : getMetamaskProvider()
  return matamaskProvider
}
