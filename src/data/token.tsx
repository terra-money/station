import { ReactNode } from "react"
import { isDenomIBC, isDenomTerra } from "@terra.kitchen/utils"
import { readDenom, truncate } from "@terra.kitchen/utils"
import { AccAddress } from "@terra-money/terra.js"
import { ASSETS } from "config/constants"
import { useIBCBaseDenom } from "./queries/ibc"
import { useTokenInfoCW20 } from "./queries/wasm"
import { useCustomTokensCW20 } from "./settings/CustomTokens"
import { useCW20Whitelist, useIBCWhitelist } from "./Terra/TerraAssets"

export const useTokenItem = (token: Token): TokenItem | undefined => {
  /* CW20 */
  const matchToken = (item: TokenItem) => item.token === token

  // 1. Local storage
  const { list } = useCustomTokensCW20()
  const customTokenItem = list.find(matchToken)

  // 2. Whitelist
  const cw20WhitelistResult = useCW20Whitelist(!!customTokenItem)
  const { data: cw20Whitelist = {} } = cw20WhitelistResult
  const listedCW20TokenItem = Object.values(cw20Whitelist).find(matchToken)

  // 3. Contract query - token info
  const shouldQueryCW20 = cw20WhitelistResult.isSuccess && !listedCW20TokenItem
  const tokenInfoResult = useTokenInfoCW20(token, shouldQueryCW20)
  const { data: tokenInfo } = tokenInfoResult
  const tokenInfoItem = tokenInfo ? { token, ...tokenInfo } : undefined

  /* IBC */
  // 1. Whitelist
  const { data: ibcWhitelist = {}, ...ibcWhitelistState } = useIBCWhitelist()
  const listedIBCTokenItem = ibcWhitelist[token.replace("ibc/", "")]

  // 2. Query denom trace
  const shouldQueryIBC = ibcWhitelistState.isSuccess && !listedIBCTokenItem
  const { data: base_denom } = useIBCBaseDenom(token, shouldQueryIBC)

  if (AccAddress.validate(token)) {
    return customTokenItem ?? listedCW20TokenItem ?? tokenInfoItem
  }

  if (isDenomIBC(token)) {
    return readIBCDenom(token, listedIBCTokenItem?.base_denom ?? base_denom)
  }

  return readNativeDenom(token)
}

interface Props {
  token: Token
  children: (token: TokenItem) => ReactNode
}

export const WithTokenItem = ({ token, children }: Props) => {
  const tokenItem = useTokenItem(token)
  if (!tokenItem) return null
  return <>{children(tokenItem)}</>
}

/* helpers */
export const getIcon = (path: string) => `${ASSETS}/icon/svg/${path}`

export const readNativeDenom = (denom: Denom): TokenItem => {
  const symbol = readDenom(denom)
  const path = isDenomTerra(denom) ? `Terra/${symbol}.svg` : `${symbol}.svg`
  return {
    token: denom,
    symbol: symbol,
    name: isDenomTerra(denom)
      ? `Terra ${denom.slice(1).toUpperCase()}`
      : undefined,
    icon: getIcon(path),
    decimals: 6,
  }
}

export const readIBCDenom = (denom: Denom, base_denom?: Denom): TokenItem => {
  const symbol = base_denom && readDenom(base_denom)
  const path = symbol ? `ibc/${symbol}.svg` : "IBC.svg"

  return {
    token: denom,
    symbol: symbol ?? truncate(denom),
    icon: getIcon(path),
    decimals: 6,
  }
}
