import BigNumber from "bignumber.js"

export const microfy = (amount: number, decimals: number) => {
  return new BigNumber(amount)
    .multipliedBy(Math.pow(10, decimals))
    .toFixed()
    .toString()
}
