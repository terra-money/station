import { PropsWithChildren, useEffect, useState } from "react"
import axios from "axios"
import { STATION_ASSETS } from "config/constants"
import createContext from "utils/createContext"
import NetworkLoading from "./NetworkLoading"
import { randomAddress } from "utils/bech32"
import {
  useCustomLCDs,
  SettingKey,
  setLocalSetting,
  pushToLocalSetting,
} from "utils/localStorage"

type TokenFilter = <T>(network: Record<string, T>) => Record<string, T>

export const [useNetworks, NetworksProvider] = createContext<{
  networks: InterchainNetworks
  filterEnabledNetworks: TokenFilter
  filterDisabledNetworks: TokenFilter
}>("useNetworks")

const InitNetworks = ({ children }: PropsWithChildren<{}>) => {
  const [networks, setNetworks] = useState<InterchainNetworks>()
  const [enabledNetworks, setEnabledNetworks] = useState<string[]>([
    "phoenix-1",
  ])
  const { customLCDs } = useCustomLCDs()
  const pushToEnabledNetworks = (chainID: string) => {
    setEnabledNetworks((prevEnabledNetworks) => [
      ...prevEnabledNetworks,
      chainID,
    ])
  }

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
    const testChains = async () => {
      if (!networks) return
      const testBase = {
        ...networks.mainnet,
        ...networks.testnet,
        ...networks.classic,
      }

      const stored = localStorage.getItem(SettingKey.NetworkCacheTime)
      const cached = stored && JSON.parse(stored)
      console.log("here", cached)

      if (cached && cached.time > Date.now() - 10 * 60 * 1000) {
        setEnabledNetworks(cached.networks)
        return
      }

      for (const network of Object.values(testBase)) {
        if (network.prefix === "terra") {
          pushToEnabledNetworks(network.chainID)
          continue
        }

        try {
          const { data } = await axios.get(
            `/cosmos/bank/v1beta1/balances/${randomAddress(network.prefix)}`,
            {
              baseURL: customLCDs[network.chainID] || network.lcd,
              timeout: 10_000,
            }
          )
          if (Array.isArray(data.balances)) {
            pushToEnabledNetworks(network.chainID)
            setLocalSetting(SettingKey.EnabledNetworks, enabledNetworks)
          }
        } catch (e) {
          console.error(e)
          return null
        }
      }
    }

    testChains()
  }, [networks, customLCDs])

  console.log("LENGTH", enabledNetworks.length)
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
