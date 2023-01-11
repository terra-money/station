import axios from "axios"
import { ASSETS, STATION_ASSETS } from "config/constants"
import { WhitelistProvider, WhitelistData } from "data/queries/chains"
import { PropsWithChildren, useEffect, useState } from "react"
import NetworkLoading from "./NetworkLoading"

const InitChains = ({ children }: PropsWithChildren<{}>) => {
  const [data, setData] = useState<WhitelistData>()
  useEffect(() => {
    ;(async () => {
      const [whitelist, ibcDenoms, legacyWhitelist] = await Promise.all([
        (async () => {
          const { data } = await axios.get("/coins.json", {
            baseURL: STATION_ASSETS,
          })
          return data
        })(),
        (async () => {
          const { data } = await axios.get("/ibc_denoms.json", {
            baseURL: STATION_ASSETS,
          })
          return data
        })(),
        (async () => {
          const { data } = await axios.get("/station/coins.json", {
            baseURL: ASSETS,
          })
          return data
        })(),
      ])

      setData({ whitelist, ibcDenoms, legacyWhitelist })
    })()
  }, [])

  if (!data)
    return <NetworkLoading title="Connecting to available networks..." />

  return <WhitelistProvider value={data}>{children}</WhitelistProvider>
}

export default InitChains
