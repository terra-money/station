import axios from "axios"
import { ASSETS } from "config/constants"
import { WhitelistProvider } from "data/queries/chains"
import { PropsWithChildren, useEffect, useState } from "react"

type Whitelist = Record<
  string,
  {
    token: string
    symbol: string
    name: string
    icon: string
    chains: string[]
    decimals: number
  }
>

const InitChains = ({ children }: PropsWithChildren<{}>) => {
  const [data, setData] = useState<Whitelist>()
  useEffect(() => {
    ;(async () => {
      const { data: whitelist } = await axios.get("/station/coins.json", {
        baseURL: ASSETS,
      })
      setData(whitelist)
    })()
  }, [])

  if (!data) return null

  return <WhitelistProvider value={data}>{children}</WhitelistProvider>
}

export default InitChains
