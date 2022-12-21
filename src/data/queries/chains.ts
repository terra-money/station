import { useNetwork } from "data/wallet"
import createContext from "utils/createContext"

type Whitelist = Record<
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

// chains and token withelist are always required from the beginning.
const [useFetchedData, WhitelistProvider] =
  createContext<Whitelist>("useWhitelist")
export { WhitelistProvider }

export function useWhitelist(): Whitelist {
  const data = useFetchedData()
  if (!data) return {}
  return data
}

export function getChainNamefromID(
  id: string | undefined,
  chains: Record<string, InterchainNetwork>
) {
  return (
    Object.values(chains)
      .find(({ chainID }) => chainID === id)
      ?.name.toLowerCase() ?? ""
  )
}

export function useIBCChannels() {
  const networks = useNetwork()

  return function getIBCChannel({
    from,
    to,
  }: {
    from: string
    to: string
  }): string {
    if (networks[from].name === "Terra") {
      return networks[to].ibc?.fromTerra ?? ""
    } else if (networks[to].name === "Terra") {
      return networks[from].ibc?.toTerra ?? ""
    } else {
      // one of the 2 chains MUST be Terra
      return ""
    }
  }
}
