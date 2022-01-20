import BigNumber from "bignumber.js"
import { readAmount, toAmount } from "@terra.kitchen/utils"
import { Coin, Coins } from "@terra-money/terra.js"
import { has } from "utils/num"

export const getPlaceholder = (decimals = 6) => "0.".padEnd(decimals + 2, "0")

export const toInput = (amount: BigNumber.Value, decimals = 6) =>
  new BigNumber(readAmount(amount, { decimals })).toNumber()

/* field array (coins) */
export interface CoinInput {
  input?: number
  denom: CoinDenom
}

export const getCoins = (coins: CoinInput[]) => {
  return new Coins(
    coins
      .map(({ input, denom }) => ({ amount: toAmount(input), denom }))
      .filter(({ amount }) => has(amount))
      .map(({ amount, denom }) => new Coin(denom, amount))
  )
}
