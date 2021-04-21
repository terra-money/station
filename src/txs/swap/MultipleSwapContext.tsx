import { FC, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { zipObj } from "ramda"
import { isDenomTerraNative } from "@terra.kitchen/utils"
import { getAmount, sortCoins } from "utils/coin"
import createContext from "utils/createContext"
import { useCurrency } from "data/settings/Currency"
import { combineState } from "data/query"
import { useBankBalance, useTerraNativeLength } from "data/queries/bank"
import { useTaxCaps, useTaxRate } from "data/queries/treasury"
import { readNativeDenom } from "data/token"
import { Card } from "components/layout"
import { Wrong } from "components/feedback"

interface MultipleSwap {
  taxRate: string
  taxCaps: Record<Denom, Amount>
  available: TokenItemWithBalance[]
}

export const [useMultipleSwap, MultipleSwapProvider] =
  createContext<MultipleSwap>("useMultipleSwap")

const MultipleSwapContext: FC = ({ children }) => {
  const { t } = useTranslation()
  const currency = useCurrency()
  const bankBalance = useBankBalance()
  const length = useTerraNativeLength()

  const denoms = sortCoins(bankBalance, currency)
    .map(({ denom }) => denom)
    .filter(isDenomTerraNative)

  /* treasury */
  const { data: taxRate, ...taxRateState } = useTaxRate()
  const taxCapsState = useTaxCaps(denoms)
  const taxCaps = taxCapsState.every(({ isSuccess }) => isSuccess)
    ? zipObj(
        denoms,
        taxCapsState.map(({ data }) => {
          if (!data) throw new Error()
          return data
        })
      )
    : undefined

  const available = useMemo(() => {
    return denoms.map((denom) => {
      const balance = getAmount(bankBalance, denom)
      return { ...readNativeDenom(denom), balance }
    })
  }, [bankBalance, denoms])

  const state = combineState(taxRateState, ...taxCapsState)

  const render = () => {
    if (length < 2)
      return <Wrong>{t("Multiple swap requires at least 2 coins")}</Wrong>

    if (!(taxRate && taxCaps && available)) return null

    return (
      <MultipleSwapProvider value={{ taxRate, taxCaps, available }}>
        {children}
      </MultipleSwapProvider>
    )
  }

  return <Card {...state}>{render()}</Card>
}

export default MultipleSwapContext
