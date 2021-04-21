import { Coins } from "@terra-money/terra.js"
import { isDenom, isDenomIBC } from "@terra.kitchen/utils"

/* coin */
export const getAmount = (coins: Coins, denom: Denom, fallback = "0") => {
  return coins.get(denom)?.amount.toString() ?? fallback
}

/* coins */
export const sortCoins = (
  coins: Coins,
  currency?: string,
  sorter?: (a: CoinData, b: CoinData) => number
) => {
  return sortByDenom(coins.toData(), currency, sorter)
}

export const sortByDenom = <T extends { denom: Denom }>(
  coins: T[],
  currency = "",
  sorter?: (a: T, b: T) => number
) =>
  coins.sort(
    (a, b) =>
      compareIs("uluna")(a.denom, b.denom) ||
      compareIs("uusd")(a.denom, b.denom) ||
      compareIs(currency)(a.denom, b.denom) ||
      compareIsDenomIBC(a.denom, b.denom) ||
      (sorter?.(a, b) ?? 0)
  )

export const sortDenoms = (denoms: Denom[], currency = "") =>
  denoms.sort(
    (a, b) =>
      compareIs("uluna")(a, b) ||
      compareIs("uusd")(a, b) ||
      compareIs(currency)(a, b) ||
      compareIsDenomIBC(a, b)
  )

export const compareIsDenomIBC = (a: string, b: string) =>
  Number(isDenomIBC(a)) - Number(isDenomIBC(b))

export const compareIs = (k: string) => (a: string, b: string) =>
  Number(b === k) - Number(a === k)

/* cw20 */
export const toAssetInfo = (token: string) => {
  return isDenom(token)
    ? { native_token: { denom: token } }
    : { token: { contract_addr: token } }
}

export const toAsset = (token: Token, amount: Amount) => {
  return { amount, info: toAssetInfo(token) }
}

const toToken = (info: AssetInfo) => {
  return "native_token" in info
    ? info.native_token.denom
    : info.token.contract_addr
}

export const toTokenItem = ({ amount, info }: Asset) => {
  return { amount, token: toToken(info) }
}
