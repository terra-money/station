import BigNumber from "bignumber.js"

export const has = (value?: BigNumber.Value) =>
  !!value && new BigNumber(value).gte(1)

export const toPrice = (n: BigNumber.Value) =>
  new BigNumber(n).dp(18, BigNumber.ROUND_DOWN).toNumber()
