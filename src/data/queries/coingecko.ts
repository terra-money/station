import { useCallback } from "react"
import { useQuery } from "react-query"
import { queryKey, RefetchOptions } from "../query"
import { CURRENCY_KEY, STATION_ASSETS, ASSETS } from "config/constants"
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

interface TFMPrice {
  chain: string
  contract_addr: string
  usd: number
  change24h: number
}

// TODO: remove hardcoded denoms
const AXELAR_TOKENS: Record<string, string> = {
  "ibc/B3504E092456BA618CC28AC671A71FB08C6CA0FD0BE7C8A5B5A3E2DD933CC9E4":
    "uusdc",
  "ibc/CBF67A2BCF6CAE343FDF251E510C8E18C361FC02B23430C121116E0811835DEF":
    "uusdt",
}

export const useExchangeRates = () => {
  const currency = useCurrency()
  const isClassic = useNetworkName() === "classic"

  return useQuery(
    [queryKey.coingecko.exchangeRates, currency, isClassic],
    async () => {
      const [{ data: TFM_IDs }, { data: prices }, fiatPrice] =
        await Promise.all([
          axios.get<Record<string, string>>("station/tfm.json", {
            baseURL: ASSETS,
          }),
          axios.get<Record<string, TFMPrice>>(
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

      const priceObject = Object.fromEntries(
        Object.entries(prices).map(([denom, { usd, change24h }]) => {
          // if token is LUNA and network is classic, use LUNC price
          if (denom === "uluna" && isClassic) {
            return [
              denom,
              {
                price: prices.uluna_classic.usd * fiatPrice,
                change: prices.uluna_classic.change24h,
              },
            ]
          }

          return [
            AXELAR_TOKENS[denom] ?? denom,
            {
              price: usd * fiatPrice,
              change: change24h,
            },
          ]
        })
      )

      Object.entries(TFM_IDs).forEach(([key, value]) => {
        if (!priceObject[key] && priceObject[value]) {
          priceObject[key] = {
            ...priceObject[value],
          }
        }
      })

      return priceObject
    },
    { ...RefetchOptions.DEFAULT }
  )
}

/* helpers */
export type CalcValue = (params: CoinData) => number | undefined

export const useMemoizedCalcValue = () => {
  const { data: memoizedPrices } = useExchangeRates()

  return useCallback<CalcValue>(
    ({ amount, denom }) => {
      if (!memoizedPrices) return
      return Number(amount) * Number(memoizedPrices[denom] ?? 0)
    },
    [memoizedPrices]
  )
}
