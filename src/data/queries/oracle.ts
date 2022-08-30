/*
 * @Author: lmk
 * @Date: 2022-05-27 11:31:35
 * @LastEditTime: 2022-05-27 11:34:02
 * @LastEditors: lmk
 * @Description:
 */
import { useCallback, useMemo } from "react"
import { getAmount, sortCoins } from "utils/coin"
import { toPrice } from "utils/num"
import { useCurrency } from "../settings/Currency"
import { Dec, Coins } from "@terra-money/terra.js"

export const useActiveDenoms = () => {
  return { data: ["umis"] }
  // const lcd = useLCDClient()
  // return useQuery(
  //   [queryKey.oracle.activeDenoms],
  //   async () => {
  //     const activeDenoms = await lcd.oracle.activeDenoms()
  //     return sortDenoms(["umis", ...activeDenoms])
  //   },
  //   { ...RefetchOptions.INFINITY }
  // )
}

export const useExchangeRates = () => {
  const coins = new Coins()
  coins.set("umis", 1)
  return { data: coins }
  // const lcd = useLCDClient()
  // return useQuery(
  //   [queryKey.oracle.exchangeRates],
  //   () => lcd.oracle.exchangeRates(),
  //   { ...RefetchOptions.DEFAULT }
  // )
}

export const useOracleParams = () => {
  return {
    data: {
      vote_period: 1,
      vote_threshold: new Dec(1.5),
      reward_band: new Dec(1.5),
      reward_distribution_window: 1,
      whitelist: [],
      slash_fraction: new Dec(1.5),
      slash_window: 1,
      min_valid_per_window: new Dec(1.5),
    },
  }

  // const lcd = useLCDClient()
  // return useQuery([queryKey.oracle.params], () => lcd.oracle.parameters(), {
  //   ...RefetchOptions.INFINITY,
  // })
}

/* helpers */
type Prices = Record<Denom, Price>
export const useMemoizedPrices = (currency: Denom) => {
  const { data: exchangeRates, ...state } = useExchangeRates()

  const prices = useMemo((): Prices | undefined => {
    if (!exchangeRates) return
    const base = toPrice(getAmount(exchangeRates, currency, "1"))

    return {
      umis: base,
      ...sortCoins(exchangeRates, currency).reduce((acc, { amount, denom }) => {
        const price = toPrice(Number(base) / Number(amount))
        return { ...acc, [denom]: price }
      }, {}),
    }
  }, [currency, exchangeRates])

  return { data: prices, ...state }
}

export type CalcValue = (params: CoinData) => number | undefined
export const useMemoizedCalcValue = (denom?: Denom) => {
  const currency = useCurrency()
  const { data: memoizedPrices } = useMemoizedPrices(denom ?? currency)

  return useCallback<CalcValue>(
    ({ amount, denom }) => {
      if (!memoizedPrices) return
      return Number(amount) * Number(memoizedPrices[denom] ?? 0)
    },
    [memoizedPrices]
  )
}
