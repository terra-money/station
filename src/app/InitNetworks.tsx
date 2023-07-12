import { PropsWithChildren, useEffect, useState } from "react"
import axios from "axios"
import { STATION_ASSETS } from "config/constants"
import createContext from "utils/createContext"
import { useCustomLCDs } from "utils/localStorage"
import { useValidNetworks } from "data/queries/tendermint"
import { WithFetching } from "components/feedback"
import { combineState } from "data/query"
import { InterchainNetworks } from "types/network"

type TokenFilter = <T>(network: Record<string, T>) => Record<string, T>

export const [useNetworks, NetworksProvider] = createContext<{
  networks: InterchainNetworks
  filterEnabledNetworks: TokenFilter
  filterDisabledNetworks: TokenFilter
  networksLoading: boolean
}>("useNetworks")

const InitNetworks = ({ children }: PropsWithChildren<{}>) => {
  const [networks, setNetworks] = useState<InterchainNetworks>()
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

  const testBase = networks
    ? Object.values(
        {
          ...networks.mainnet,
          ...networks.testnet,
          ...networks.classic,
        } ?? {}
      ).map((chain) => {
        const lcd = customLCDs[chain?.chainID] ?? chain.lcd
        return { ...chain, lcd }
      })
    : []

  const validationResult = useValidNetworks(testBase)

  const validNetworks = validationResult.reduce(
    (acc, { data }) => (data ? [...acc, data] : acc),
    [] as string[]
  )

  const validationState = combineState(...validationResult)

  if (!networks) return null

  return (
    <WithFetching {...validationState} height={2}>
      {(progress) => (
        <NetworksProvider
          value={{
            networks,
            networksLoading: validationState.isLoading,
            filterEnabledNetworks: (networks) =>
              Object.fromEntries(
                Object.entries(networks ?? {}).filter(
                  ([chainID]) =>
                    chainID === "localterra" || validNetworks.includes(chainID)
                ) ?? {}
              ),
            filterDisabledNetworks: (networks) =>
              Object.fromEntries(
                Object.entries(networks ?? {}).filter(
                  ([chainID]) => !validNetworks.includes(chainID)
                ) ?? {}
              ),
          }}
        >
          {progress}
          {children}
        </NetworksProvider>
      )}
    </WithFetching>
  )
}

export default InitNetworks
