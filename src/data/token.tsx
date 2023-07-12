import { ReactNode } from "react"
import { isDenomIBC } from "@terra-money/terra-utils"
import { readDenom, truncate } from "@terra-money/terra-utils"
import { AccAddress } from "@terra-money/feather.js"
import { ASSETS } from "config/constants"
import { useTokenInfoCW20 } from "./queries/wasm"
import { useCustomTokensCW20 } from "./settings/CustomTokens"
import {
  useGammTokens,
  GAMM_TOKEN_DECIMALS,
  OSMO_ICON,
} from "./external/osmosis"
import { useCW20Whitelist, useIBCWhitelist } from "./Terra/TerraAssets"
import { useWhitelist } from "./queries/chains"
import { useNetworkName, useNetwork } from "./wallet"
import { getChainIDFromAddress } from "utils/bech32"

const DEFAULT_NATIVE_DECIMALS = 6

export const useTokenItem = (
  token: Token,
  chainID?: string
): TokenItem | undefined => {
  const readNativeDenom = useNativeDenoms()

  /* CW20 */
  const matchToken = (item: TokenItem) => item.token === token

  // 1. Local storage
  const { list } = useCustomTokensCW20()
  const customTokenItem = list.find(matchToken)

  // 2. Whitelist
  const cw20WhitelistResult = useCW20Whitelist(!!customTokenItem)
  const { data: cw20Whitelist = {} } = cw20WhitelistResult
  const listedCW20TokenItem = Object.values(cw20Whitelist ?? {}).find(
    matchToken
  )

  // 3. Contract query - token info
  const shouldQueryCW20 = cw20WhitelistResult.isSuccess && !listedCW20TokenItem
  const tokenInfoResult = useTokenInfoCW20(token, shouldQueryCW20)
  const { data: tokenInfo } = tokenInfoResult
  const tokenInfoItem = tokenInfo ? { token, ...tokenInfo } : undefined

  /* IBC */
  // 1. Whitelist
  const { data: ibcWhitelist = {} } = useIBCWhitelist()
  const listedIBCTokenItem = ibcWhitelist[token.replace("ibc/", "")]

  // 2. Query denom trace
  //const shouldQueryIBC = ibcWhitelistState.isSuccess && !listedIBCTokenItem
  //const { data: base_denom } = useIBCBaseDenom(token, shouldQueryIBC)

  if (AccAddress.validate(token)) {
    return customTokenItem ?? listedCW20TokenItem ?? tokenInfoItem
  }

  if (isDenomIBC(token)) {
    const item = {
      ...listedIBCTokenItem,
      denom: token,
      base_denom: listedIBCTokenItem?.base_denom,
    }

    return readIBCDenom(item)
  }

  return readNativeDenom(token, chainID)
}

interface Props {
  token: Token
  chainID?: string
  children: (token: TokenItem) => ReactNode
}

export const WithTokenItem = ({ token, chainID, children }: Props) => {
  const readNativeDenom = useNativeDenoms()
  return <>{children(readNativeDenom(token, chainID))}</>
}

/* helpers */
export const getIcon = (path: string) => `${ASSETS}/icon/svg/${path}`

export const useNativeDenoms = () => {
  const { whitelist, ibcDenoms } = useWhitelist()
  const { list: cw20 } = useCustomTokensCW20()
  const networkName = useNetworkName()
  const networks = useNetwork()
  const gammTokens = useGammTokens()

  let decimals = DEFAULT_NATIVE_DECIMALS

  function readNativeDenom(
    denom: Denom,
    chainID?: string
  ): TokenItem & { isNonWhitelisted?: boolean } {
    let tokenType = ""
    if (denom.startsWith("ibc/")) {
      tokenType = "ibc"
    } else if (denom.startsWith("factory/")) {
      tokenType = "factory"
    } else if (denom.startsWith("gamm/")) {
      tokenType = "gamm"
      decimals = GAMM_TOKEN_DECIMALS
    }

    let fixedDenom = ""
    switch (tokenType) {
      case "ibc":
        fixedDenom = `${readDenom(denom).substring(0, 5)}...`
        break

      case "gamm":
        fixedDenom = gammTokens.get(denom) ?? readDenom(denom)
        break

      case "factory": {
        const factoryParts = denom.split(/[/:]/)
        let tokenAddress = ""
        if (factoryParts.length >= 2) {
          tokenAddress = factoryParts.slice(2).join(" ")
        }
        fixedDenom = tokenAddress
        break
      }

      default:
        fixedDenom = readDenom(denom)
    }

    let factoryIcon
    if (tokenType === "factory") {
      const tokenAddress = denom.split(/[/:]/)[1]
      const chainID = getChainIDFromAddress(tokenAddress, networks)
      if (chainID) {
        factoryIcon = networks[chainID].icon
      }
    }

    if (tokenType === "gamm") {
      factoryIcon = OSMO_ICON
    }

    // native token
    if (chainID) {
      const tokenID = `${chainID}:${denom}`

      if (whitelist[networkName]?.[tokenID])
        return whitelist[networkName]?.[tokenID]
    } else {
      const tokenDetails = Object.values(whitelist[networkName] ?? {}).find(
        ({ token }) => token === denom
      )
      if (tokenDetails) return tokenDetails
    }

    // ibc token
    let ibcToken = chainID
      ? ibcDenoms[networkName]?.[`${chainID}:${denom}`]
      : Object.entries(ibcDenoms[networkName] ?? {}).find(
          ([k]) => k.split(":")[1] === denom
        )?.[1]

    if (
      ibcToken &&
      whitelist[networkName][ibcToken?.token] &&
      (!chainID || ibcToken?.chainID === chainID)
    ) {
      return {
        ...whitelist[networkName][ibcToken?.token],
        // @ts-expect-error
        chains: [ibcToken?.chainID],
      }
    }

    if (denom === "uluna") {
      if (chainID === "columbus-5" || (!chainID && networkName === "classic")) {
        return {
          token: denom,
          symbol: "LUNC",
          name: "Luna Classic",
          icon: "https://assets.terra.money/icon/svg/LUNC.svg",
          decimals: 6,
          isNonWhitelisted: false,
        }
      } else if (chainID === "phoenix-1" || chainID === "pisco-1") {
        return {
          token: denom,
          symbol: "LUNA",
          name: "Luna",
          icon: "https://assets.terra.money/icon/svg/Luna.svg",
          decimals: 6,
          isNonWhitelisted: false,
        }
      }
    }

    return (
      cw20.find(({ token }) => denom === token) ?? {
        // default token icon
        token: denom,
        symbol: fixedDenom,
        name: fixedDenom,
        type: tokenType,
        icon:
          tokenType === "ibc"
            ? "https://assets.terra.money/icon/svg/IBC.svg"
            : tokenType === "factory" || tokenType === "gamm"
            ? factoryIcon
            : "https://assets.terra.money/icon/svg/Terra.svg",
        decimals,
        isNonWhitelisted: true,
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
