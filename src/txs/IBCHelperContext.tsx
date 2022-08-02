import { PropsWithChildren, useCallback } from "react"
import createContext from "utils/createContext"
import { useIBCWhitelist } from "data/Terra/TerraAssets"

export type FindDecimals = (token: string) => number
export const [useIBCHelper, IBCHelperProvider] = createContext<{
  findDecimals: FindDecimals
}>("useIBC")

const IBCHelperContext = ({ children }: PropsWithChildren<{}>) => {
  const { data: ibcWhitelist } = useIBCWhitelist()

  const findDecimals = useCallback(
    (token: string) => {
      if (!ibcWhitelist) throw new Error()
      const item = ibcWhitelist[token.replace("ibc/", "")]
      return item?.decimals ?? 6
    },
    [ibcWhitelist]
  )

  if (!ibcWhitelist) return null

  return (
    <IBCHelperProvider value={{ findDecimals }}>{children}</IBCHelperProvider>
  )
}

export default IBCHelperContext
