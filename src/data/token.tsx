import { ReactNode } from "react"
import { isDenomIBC } from "@terra.kitchen/utils"
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
    const item = {
      ...listedIBCTokenItem,
      denom: token,
      base_denom: listedIBCTokenItem?.base_denom ?? base_denom,
    }

    return readIBCDenom(item)
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

// TODO: move to assets.terra.money
const WHITELIST: Record<string, TokenItem> = {
  uluna: {
    token: "uluna",
    symbol: "Luna",
    name: "Terra Luna",
    icon: "https://assets.terra.money/icon/svg/Luna.svg",
    decimals: 6,
  },
  uosmo: {
    token: "uosmo",
    symbol: "Osmo",
    name: "Osmosis",
    icon: "https://assets.terra.money/icon/svg/ibc/OSMO.svg",
    decimals: 6,
  },
  // Luna on Osmosis
  "ibc/785AFEC6B3741100D15E7AF01374E3C4C36F24888E96479B1C33F5C71F364EF9": {
    token: "uluna",
    symbol: "Luna",
    name: "Terra Luna",
    icon: "https://assets.terra.money/icon/svg/Luna.svg",
    decimals: 6,
  },
  // Osmo on Terra
  "ibc/0471F1C4E7AFD3F07702BEF6DC365268D64570F7C1FDC98EA6098DD6DE59817B": {
    token: "uosmo",
    symbol: "Osmo",
    name: "Osmosis",
    icon: "https://assets.terra.money/icon/svg/ibc/OSMO.svg",
    decimals: 6,
  },
}

export const readNativeDenom = (denom: Denom): TokenItem => {
  // TODO: support multiple native tokens
  const symbol = readDenom(denom)

  return (
    // TODO: change default token icon
    WHITELIST[denom] ?? {
      token: denom,
      symbol,
      name: symbol,
      icon: "https://assets.terra.money/icon/svg/Luna.svg",
      decimals: 6,
    }
  )
}

export const readIBCDenom = (item: IBCTokenItem): TokenItem => {
  const { denom, base_denom } = item
  const symbol =
    item.symbol ?? ((base_denom && readDenom(base_denom)) || base_denom)
  const path = symbol ? `ibc/${symbol}.svg` : "IBC.svg"

  return {
    token: denom,
    symbol: symbol ?? truncate(denom),
    icon: getIcon(path),
    decimals: item.decimals ?? 6,
  }
}
