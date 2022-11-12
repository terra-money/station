import createContext from "utils/createContext"

interface Chains {
  chains: Record<
    "mainnet" | "testnet",
    Record<
      string,
      {
        chainID: string
        lcd: string
        gasAdjustment: number
        gasPrices: Object
        prefix: string
        name: string
        icon: string
      }
    >
  >
  whitelist: Record<
    string,
    {
      token: string
      symbol: string
      name: string
      icon: string
      chains: string[]
      decimals: number
    }
  >
}

// chains and token withelist are always required from the beginning.
const [useFetchedData, ChainsProvider] = createContext<Chains>("useChains")
export { ChainsProvider }

export function useChains(
  network?: "mainnet" | "testnet"
): Chains["chains"]["mainnet"] {
  const data = useFetchedData()
  if (!data) return {}

  return data.chains[network ?? "mainnet"]
}

export function useWhitelist(): Chains["whitelist"] {
  const data = useFetchedData()
  if (!data) return {}

  return data.whitelist
}
