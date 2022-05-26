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
      const { data: chains } = await axios.get<TerraNetworks>("/chains.json", {
        baseURL: ASSETS,
      })

      console.log(chains)

      const networks = {
        ...chains,
        localterra: { ...chains.localterra, preconfigure: true },
        testnet: {
          name: "testnet",
          chainID: "pisco-1",
          lcd: "https://pisco-lcd.terra.dev",
          mantle: "https://pisco-mantle.terra.dev",
          walletconnectID: 0,
        },
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
