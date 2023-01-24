import { useCallback, useMemo } from "react"
import { useQuery } from "react-query"
import { queryKey, RefetchOptions } from "../query"
import { ASSETS, CURRENCY_KEY, STATION_ASSETS } from "config/constants"
import axios from "axios"
import { useCurrency } from "data/settings/Currency"
import { useNetworkName } from "data/wallet"

// TODO: remove/move somewhere else
export const useActiveDenoms = () => {
  return useQuery(
    [queryKey.coingecko.activeDenoms],
    async () => {
      return ["uluna"]
    },
    { ...RefetchOptions.INFINITY }
  )
}

export const useSupportedFiat = () => {
  return useQuery(
    [queryKey.coingecko.supportedFiat],
    async () => {
      const { data } = await axios.get("currencies.json", {
        baseURL: STATION_ASSETS,
      })
      return data as { name: string; symbol: string; id: string }[]
    },
    { ...RefetchOptions.INFINITY }
  )
}

export const useExchangeRates = () => {
  const currency = useCurrency()
  const networkName = useNetworkName()

  return useQuery(
    [queryKey.coingecko.exchangeRates, currency],
    async () => {
      const [{ data: TFM_IDs }, { data: prices }, fiatPrice] =
        await Promise.all([
          axios.get<Record<string, string>>("station/tfm.json", {
            baseURL: ASSETS,
          }),
          await axios.get<Record<string, Record<string, number>>>(
            `https://price.api.tfm.com/tokens/?limit=1500`
          ),
          (async () => {
            if (currency.id === "USD") return 1

            const { data } = await axios.get<{
              quotes: Record<string, number>
            }>(
              `https://apilayer.net/api/live?source=USD&currencies=${currency.id}&access_key=${CURRENCY_KEY}`
            )

            return data?.quotes?.[`USD${currency.id}`] ?? 1
          })(),
        ])

      const filteredPrices = Object.keys(TFM_IDs)
        .filter((denom) =>
          networkName === "classic"
            ? denom.endsWith(":classic")
            : !denom.endsWith(":classic")
        )
        .reduce((acc, denom) => {
          return {
            ...acc,
            [denom.replace(":classic", "")]: {
              price: prices[TFM_IDs[denom]].usd * fiatPrice,
              change: prices[TFM_IDs[denom]].change24h,
            },
          }
        }, {})

      return { exchangeRates: filteredPrices, allPrices: prices }
    },
    { ...RefetchOptions.DEFAULT }
  )
}

/* helpers */
type Prices = Record<Denom, { price: Price; change: number }>

export const useMemoizedPrices = () => {
  const { data, ...state } = useExchangeRates()
  const exchangeRates = data?.exchangeRates

  const prices = useMemo((): Prices | undefined => {
    return exchangeRates
  }, [exchangeRates])

  return { data: prices, ...state }
}

export const useAllMemoizedPrices = () => {
  const { data, ...state } = useExchangeRates()
  const allPrices = data?.allPrices

  const prices = useMemo(() => {
    return allPrices
  }, [allPrices])

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
