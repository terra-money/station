import axios from "axios"
import { ASSETS } from "config/constants"
import { ChainsProvider } from "data/queries/chains"
import { PropsWithChildren, useEffect, useState } from "react"

const InitChains = ({ children }: PropsWithChildren<{}>) => {
  const [data, setData] = useState<any>()
  useEffect(() => {
    ;(async () => {
      const [{ data: chains }, { data: whitelist }] = await Promise.all([
        axios.get("/station/chains.json", { baseURL: ASSETS }),
        axios.get("/station/coins.json", { baseURL: ASSETS }),
      ])
      setData({ chains, whitelist })
    })()
  }, [])

  if (!data) return null

  return <ChainsProvider value={data}>{children}</ChainsProvider>
}

export default InitChains
