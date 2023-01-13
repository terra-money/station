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

type IBCDenoms = Record<
  string,
  Record<
    string,
    {
      token: string
      chain: string
    }
  >
>

export interface WhitelistData {
  whitelist: Record<string, Whitelist>
  ibcDenoms: IBCDenoms
  legacyWhitelist: Whitelist
}

// chains and token withelist are always required from the beginning.
const [useFetchedData, WhitelistProvider] =
  createContext<WhitelistData>("useWhitelist")
export { WhitelistProvider }

export function useWhitelist(): WhitelistData {
  const data = useFetchedData()
  if (!data) return { whitelist: {}, ibcDenoms: {}, legacyWhitelist: {} }
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

export function getChainIdFromAddress(
  address: string,
  chains: Record<string, InterchainNetwork>
) {
  return (
    Object.values(chains)
      .find(({ prefix }) => address.includes(prefix))
      ?.chainID.toLowerCase() ?? ""
  )
}

export function useIBCChannels() {
  const networks = useNetwork()

  return {
    getIBCChannel: ({
      from,
      to,
      ics,
    }: {
      from: string
      to: string
      ics?: boolean
    }): string | undefined => {
      if (networks[from].prefix === "terra") {
        return ics
          ? networks[to].ibc?.ics?.fromTerra
          : networks[to].ibc?.fromTerra
      } else if (networks[to].prefix === "terra") {
        return ics
          ? networks[from].ibc?.ics?.toTerra
          : networks[from].ibc?.toTerra
      }
    },

    getICSContract: ({
      from,
      to,
    }: {
      from: string
      to: string
    }): string | undefined => {
      if (networks[from].prefix === "terra") {
        return networks[to].ibc?.ics?.contract
      } else if (networks[to].prefix === "terra") {
        return networks[from].ibc?.ics?.contract
      }
    },
  }
}
