import { PropsWithChildren, useEffect, useState } from "react"
import axios from "axios"
import { STATION_ASSETS } from "config/constants"
import createContext from "utils/createContext"
import { randomAddress } from "utils/bech32"
import { useCustomLCDs, SettingKey } from "utils/localStorage"
import NetworkLoading from "./NetworkLoading"
import { isTerraChain } from "utils/chain"

type TokenFilter = <T>(network: Record<string, T>) => Record<string, T>

export const [useNetworks, NetworksProvider] = createContext<{
  networks: InterchainNetworks
  filterEnabledNetworks: TokenFilter
  filterDisabledNetworks: TokenFilter
}>("useNetworks")

const InitNetworks = ({ children }: PropsWithChildren<{}>) => {
  const [networks, setNetworks] = useState<InterchainNetworks>()
  const [enabledNetworks, setEnabledNetworks] = useState<string[]>([])
  const { customLCDs } = useCustomLCDs()

  useEffect(() => {
    const fetchChains = async () => {
      const { data: chains } = await axios.get<InterchainNetworks>(
        "/chains.json",
        {
          baseURL: STATION_ASSETS,
        }
      )
      setNetworks(chains)
    }

    fetchChains()
  }, [])

  useEffect(() => {
    const testChains = () => {
      const stored = localStorage.getItem(SettingKey.EnabledNetworks)
      const cached = stored && JSON.parse(stored)

      if (cached && cached.time > Date.now() - 10 * 60 * 1000) {
        setEnabledNetworks(cached.networks)
        return
      }

      if (!networks) return
      const testBase = Object.values({
        ...networks.mainnet,
        ...networks.testnet,
        ...networks.classic,
      })

      for (const { chainID, prefix, lcd } of testBase) {
        if (isTerraChain(chainID)) return chainID
        axios
          .get(`/cosmos/bank/v1beta1/balances/${randomAddress(prefix)}`, {
            baseURL: customLCDs[chainID] || lcd,
            timeout: 2_000,
          })
          .then(({ data }) => {
            Array.isArray(data.balances) &&
              setEnabledNetworks((prev) => [...prev, chainID])
          })
          .catch((e) => null)
      }
    }

    testChains()
  }, [networks, customLCDs])

  if (!(networks && enabledNetworks.some(isTerraChain)))
    return <NetworkLoading />

  return (
    <NetworksProvider
      value={{
        networks,
        filterEnabledNetworks: (networks) =>
          Object.fromEntries(
            Object.entries(networks).filter(
              ([chainID]) =>
                chainID === "localterra" || enabledNetworks.includes(chainID)
            )
          ),
        filterDisabledNetworks: (networks) =>
          Object.fromEntries(
            Object.entries(networks).filter(
              ([chainID]) => !enabledNetworks.includes(chainID)
            )
          ),
      }}
    >
      {children}
    </NetworksProvider>
  )
}

export default InitNetworks
