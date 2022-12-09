import { PropsWithChildren, useEffect, useState } from "react"
import axios from "axios"
import { ASSETS } from "config/constants"
import createContext from "utils/createContext"
import { useCustomNetworks } from "data/settings/CustomNetworks"

export const [useNetworks, NetworksProvider] =
  createContext<InterchainNetworks>("useNetworks")

const InitNetworks = ({ children }: PropsWithChildren<{}>) => {
  const [networks, setNetworks] = useState<InterchainNetworks>()
  const { list } = useCustomNetworks()

  useEffect(() => {
    const fetchChains = async () => {
      const { data: chains } = await axios.get<InterchainNetworks>(
        "/station/chains.json",
        {
          baseURL: ASSETS,
        }
      )

      setNetworks(chains)
    }

    fetchChains()
  }, [list])

  if (!networks) return null
  return <NetworksProvider value={networks}>{children}</NetworksProvider>
}

export default InitNetworks
