import { useCallback, useMemo } from "react"
import { useQuery } from "react-query"
import { getAmount, sortCoins, sortDenoms } from "utils/coin"
import { toPrice } from "utils/num"
import { queryKey, RefetchOptions } from "../query"
import { useCurrency } from "../settings/Currency"
import { useLCDClient } from "./lcdClient"

export const useActiveDenoms = () => {
  const lcd = useLCDClient()
  return useQuery(
    [queryKey.oracle.activeDenoms],
    async () => {
      const activeDenoms = await lcd.oracle.activeDenoms()
      return sortDenoms(["uluna", ...activeDenoms])
    },
    { ...RefetchOptions.INFINITY }
  )
}

export const useExchangeRates = () => {
  const lcd = useLCDClient()
  return useQuery(
    [queryKey.oracle.exchangeRates],
    () => lcd.oracle.exchangeRates(),
    { ...RefetchOptions.DEFAULT }
  )
}

export const useOracleParams = () => {
  const lcd = useLCDClient()
  return useQuery([queryKey.oracle.params], () => lcd.oracle.parameters(), {
    ...RefetchOptions.INFINITY,
  })
}

/* helpers */
type Prices = Record<Denom, Price>
export const useMemoizedPrices = (currency: Denom) => {
  const { data: exchangeRates, ...state } = useExchangeRates()

  const prices = useMemo((): Prices | undefined => {
    if (!exchangeRates) return
    const base = toPrice(getAmount(exchangeRates, currency, "1"))

    return {
      uluna: base,
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
