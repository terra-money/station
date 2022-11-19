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
        gasPrices: Record<string, number>
        prefix: string
        name: string
        icon: string
        ibc?: {
          toTerra: string
          fromTerra: string
        }
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

export function useIBCChannels() {
  const chains = useChains()

  return function getIBCChannel({
    from,
    to,
  }: {
    from: string
    to: string
  }): string {
    if (chains[from].name === "Terra") {
      return chains[to].ibc?.fromTerra ?? ""
    } else if (chains[to].name === "Terra") {
      return chains[from].ibc?.toTerra ?? ""
    } else {
      // one of the 2 chains MUST be Terra
      return ""
    }
  }
}
