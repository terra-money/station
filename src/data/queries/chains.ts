import { AccAddress } from "@terra-money/feather.js"
import { useNetwork } from "data/wallet"
import { InterchainNetwork } from "types/network"
import createContext from "utils/createContext"
import { DefaultDisplayChains } from "utils/localStorage"

type Whitelist = Record<
  string,
  {
    token: string
    symbol: string
    name: string
    icon: string
    chains: string[]
    decimals: number
    isAxelar?: boolean
    lsd?: string
  }
>

type IBCDenoms = Record<
  string,
  Record<
    string,
    {
      token: string
      chainID: string
      icsChannel?: string
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
  const chainName =
    Object.values(chains ?? {})
      .find(({ chainID }) => chainID === id)
      ?.name.toLowerCase() ?? ""

  const titleCasedChainName = chainName.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
  })

  return titleCasedChainName
}

export const getTruncateChainList = (
  chainList: string[],
  toShowLength = 5
) => ({
  toShow: chainList.slice(0, toShowLength),
  rest: chainList.slice(toShowLength),
})
export const getDisplayChainsSettingLabel = (
  displayChains: string[],
  chains: Record<string, InterchainNetwork>
) => {
  const { toShow, rest } = getTruncateChainList(displayChains)
  return Object.values(DefaultDisplayChains ?? {}).some(
    (arr) => JSON.stringify(arr) === JSON.stringify(displayChains)
  )
    ? "Default"
    : toShow
        .map((chainID) => getChainNamefromID(chainID, chains))
        .filter((chain) => chain)
        .join(", ") +
        (rest.length > 0
          ? ` & ${rest.length} other${rest.length === 1 ? "" : "s"}`
          : "")
}

export function useIBCChannels() {
  const networks = useNetwork()

  return {
    getIBCChannel: ({
      from,
      to,
      tokenAddress,
      icsChannel,
    }: {
      from: string
      to: string
      tokenAddress: AccAddress
      icsChannel?: string
    }): string | undefined => {
      const isCW20 = AccAddress.validate(tokenAddress)

      if (isCW20) {
        return networks[from]?.icsChannels?.[to]?.channel
      }

      if (
        icsChannel &&
        networks[to]?.icsChannels?.[from]?.channel === icsChannel
      ) {
        return networks[to]?.icsChannels?.[from]?.otherChannel
      }

      return networks[from]?.channels?.[to]
    },

    getICSContract: ({
      from,
      to,
    }: {
      from: string
      to: string
    }): string | undefined => {
      return networks[from]?.icsChannels?.[to]?.contract
    },
  }
}
