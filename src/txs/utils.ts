import { readAmount, toAmount } from "@terra-money/terra-utils"
import { Coin, Coins } from "@terra-money/feather.js"
import { getShouldTax } from "data/queries/treasury"
import { FindDecimals } from "./IBCHelperContext"
import { calcMinimumTaxAmount } from "./Tx"
import BigNumber from "bignumber.js"
import { has } from "utils/num"
import axios from "axios"

// Intercept all axios errors.
axios.interceptors.response.use(
  (response) => response,
  (error) => {}
)

export const getPlaceholder = (decimals = 6) => "0.".padEnd(decimals + 2, "0")

export const toInput = (amount: BigNumber.Value, decimals = 6) =>
  new BigNumber(readAmount(amount, { decimals })).toNumber()

/* field array (coins) */
export interface CoinInput {
  input?: number
  denom: CoinDenom
  taxRequired?: boolean
}

export const getCoins = (coins: CoinInput[], findDecimals?: FindDecimals) => {
  return new Coins(
    coins
      .map(({ input, denom }) => {
        const decimals = findDecimals?.(denom)
        return { amount: toAmount(input, { decimals }), denom }
      })
      .filter(({ amount }) => has(amount))
      .map(({ amount, denom }) => new Coin(denom, amount))
  )
}

export interface TaxParams {
  taxRate?: string
  taxCap?: string
}

export const calcTaxes = (
  coins: CoinInput[],
  { taxRate = "0", taxCap = "0" }: TaxParams,
  isClassic: boolean
) => {
  return new Coins(
    coins
      .filter(({ input, denom, taxRequired }) => {
        const amount = toAmount(input)
        return getShouldTax(denom, isClassic) && has(amount) && taxRequired
      })
      .map(({ input, denom, taxRequired }) => {
        const amount = toAmount(input)
        const tax = calcMinimumTaxAmount(amount, {
          rate: taxRequired ? taxRate : "0",
          cap: taxCap,
        })

        if (!tax) throw new Error()
        return new Coin(denom, tax)
      })
  )
}
