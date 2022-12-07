import { ReactNode } from "react"
import { isDenomIBC } from "@terra.kitchen/utils"
import { readDenom, truncate } from "@terra.kitchen/utils"
import { AccAddress } from "@terra-money/terra.js"
import { ASSETS } from "config/constants"
import { useIBCBaseDenom } from "./queries/ibc"
import { useTokenInfoCW20 } from "./queries/wasm"
import { useCustomTokensCW20 } from "./settings/CustomTokens"
import { useCW20Whitelist, useIBCWhitelist } from "./Terra/TerraAssets"
import { useWhitelist } from "./queries/chains"

export const useTokenItem = (token: Token): TokenItem | undefined => {
  const readNativeDenom = useNativeDenoms()

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
  const readNativeDenom = useNativeDenoms()
  return <>{children(readNativeDenom(token))}</>
}

/* helpers */
export const getIcon = (path: string) => `${ASSETS}/icon/svg/${path}`

export const useNativeDenoms = () => {
  const whitelist = useWhitelist()
  const { list: cw20 } = useCustomTokensCW20()

  function readNativeDenom(denom: Denom): TokenItem {
    const fixedDenom = denom.startsWith("ibc/")
      ? `${readDenom(denom).substring(0, 5)}...`
      : readDenom(denom)
    return (
      whitelist[denom] ??
      cw20.find(({ token }) => denom === token) ??
      // that's needed for axl tokens
      Object.values(whitelist).find((t) => t.token === denom) ?? {
        // default token icon
        token: denom,
        symbol: fixedDenom,
        name: fixedDenom,
        icon: denom.startsWith("ibc/")
          ? "https://assets.terra.money/icon/svg/IBC.svg"
          : "https://assets.terra.money/icon/svg/Terra.svg",
        decimals: 6,
      }
    )
  }

  return readNativeDenom
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
