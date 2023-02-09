import { PropsWithChildren, useEffect, useState } from "react"
import axios from "axios"
import { STATION_ASSETS } from "config/constants"
import createContext from "utils/createContext"
import { randomAddress } from "utils/bech32"
import { useCustomLCDs, SettingKey, setLocalSetting } from "utils/localStorage"
import { useNetworkName } from "data/wallet"

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
  const name = useNetworkName()

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
  }, [name])

  useEffect(() => {
    const testChains = () => {
      if (!networks) return
      const testBase = {
        ...networks.mainnet,
        ...networks.testnet,
        ...networks.classic,
      }

      // const stored = localStorage.getItem(SettingKey.NetworkCacheTime)
      // const cached = stored && JSON.parse(stored)

      // if (cached && cached.time > Date.now() - 10 * 60 * 1000) {
      //   setEnabledNetworks(cached.networks)
      //   return
      // }

      for (const network of Object.values(testBase)) {
        try {
          axios
            .get(
              `/cosmos/bank/v1beta1/balances/${randomAddress(network.prefix)}`,
              {
                baseURL: customLCDs[network.chainID] || network.lcd,
                timeout: 5_000,
              }
            )
            .then(({ data }) => {
              if (Array.isArray(data.balances)) {
                setEnabledNetworks((prev) => [...prev, network.chainID])
              }
            })
        } catch (e) {
          console.error(e)
          return null
        }
      }
      console.log(enabledNetworks)
      // setLocalSetting(SettingKey.EnabledNetworks, enabledNetworks)
    }

    testChains()
  }, [networks, customLCDs])

  if (!networks) return null

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
