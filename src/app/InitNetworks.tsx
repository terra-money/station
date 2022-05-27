import { PropsWithChildren, useEffect, useState } from "react"
import { fromPairs } from "ramda"
import axios from "axios"
import { ASSETS } from "config/constants"
import createContext from "utils/createContext"
import { useCustomNetworks } from "data/settings/CustomNetworks"

export const [useNetworks, NetworksProvider] =
  createContext<CustomNetworks>("useNetworks")

const InitNetworks = ({ children }: PropsWithChildren<{}>) => {
  const [networks, setNetworks] = useState<CustomNetworks>()
  const { list } = useCustomNetworks()

  useEffect(() => {
    const fetchChains = async () => {
      // const { data: chains } = await axios.get<TerraNetworks>("/chains.json", {
      //   baseURL: ASSETS,
      // })

      const chains = {
        mainnet: {
          name: "mainnet",
          chainID: "mainnet",
          lcd: "https://rest.gw.mises.site",
          walletconnectID: 1,
        },
        localnet: {
          name: "local",
          chainID: "test",
          lcd: "http://localhost:1317",
        },
      }

      const networks = {
        ...chains,
        localnet: { ...chains.localnet, preconfigure: true },
      }

      setNetworks({
        ...networks,
        ...fromPairs(list.map((item) => [item.name, item])),
      })
    }

    fetchChains()
  }, [list])

  if (!networks) return null
  return <NetworksProvider value={networks}>{children}</NetworksProvider>
}

export default InitNetworks
