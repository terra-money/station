import BigNumber from "bignumber.js"
import { toAmount } from "@terra.kitchen/utils"

export const has = (value?: BigNumber.Value) =>
  !!value && new BigNumber(value).gte(1)

export const toPrice = (n: BigNumber.Value) =>
  new BigNumber(n).dp(18, BigNumber.ROUND_DOWN).toNumber()

export const getRatio = (current: string, total: string) =>
  new BigNumber(toAmount(current)).div(toAmount(total)).toString()
