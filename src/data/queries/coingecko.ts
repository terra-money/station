import { useCallback, useMemo } from "react"
import { useQuery } from "react-query"
import { sortDenoms } from "utils/coin"
import { queryKey, RefetchOptions, useIsClassic } from "../query"
import { useLCDClient } from "./lcdClient"
import { ASSETS } from "config/constants"
import axios from "axios"
import { useCurrency } from "data/settings/Currency"

// TODO: remove/move somewhere else
export const useActiveDenoms = () => {
  const lcd = useLCDClient()
  const isClassic = useIsClassic()

  return useQuery(
    [queryKey.coingecko.activeDenoms, isClassic],
    async () => {
      if (isClassic) {
        const activeDenoms = await lcd.oracle.activeDenoms()
        return sortDenoms(["uluna", ...activeDenoms])
      } else {
        return ["uluna"]
      }
    },
    { ...RefetchOptions.INFINITY }
  )
}

export const useSupportedFiat = () => {
  return useQuery(
    [queryKey.coingecko.supportedFiat],
    async () => {
      const { data } = await axios.get(
        "https://api.coingecko.com/api/v3/exchange_rates"
      )
      const result: { name: string; unit: string; id: string }[] = []
      Object.keys(data.rates).forEach((id) => {
        data.rates[id].type === "fiat" && result.push({ id, ...data.rates[id] })
      })
      return result
    },
    { ...RefetchOptions.INFINITY }
  )
}

export const useExchangeRates = () => {
  const currency = useCurrency()

  return useQuery(
    [queryKey.coingecko.exchangeRates, currency],
    async () => {
      const { data: coingeckoIDs } = await axios.get<Record<string, string>>(
        "station/coingecko.json",
        { baseURL: ASSETS }
      )
      const { data: prices } = await axios.get<
        Record<string, Record<string, number>>
      >(
        `https://api.coingecko.com/api/v3/simple/price?ids=${Object.values(
          coingeckoIDs
        ).join(",")}&vs_currencies=${currency.id}&include_24hr_change=true`
      )

      return Object.keys(coingeckoIDs).reduce((acc, denom) => {
        return {
          ...acc,
          [denom]: {
            price: prices[coingeckoIDs[denom]][currency.id],
            change: prices[coingeckoIDs[denom]][`${currency.id}_24h_change`],
          },
        }
      }, {})
    },
    { ...RefetchOptions.DEFAULT }
  )
}

/* helpers */
type Prices = Record<Denom, { price: Price; change: number }>
export const useMemoizedPrices = () => {
  const { data: exchangeRates, ...state } = useExchangeRates()

  const prices = useMemo((): Prices | undefined => {
    return exchangeRates
  }, [exchangeRates])

  return { data: prices, ...state }
}

export type CalcValue = (params: CoinData) => number | undefined

export const useMemoizedCalcValue = () => {
  const { data: memoizedPrices } = useMemoizedPrices()

  return useCallback<CalcValue>(
    ({ amount, denom }) => {
      if (!memoizedPrices) return
      return Number(amount) * Number(memoizedPrices[denom] ?? 0)
    },
    [memoizedPrices]
  )
}
