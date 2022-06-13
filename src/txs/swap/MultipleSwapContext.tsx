import { PropsWithChildren, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { isDenomTerraNative } from "@terra.kitchen/utils"
import { getAmount, sortCoins } from "utils/coin"
import createContext from "utils/createContext"
import { useCurrency } from "data/settings/Currency"
import { useIsClassic } from "data/query"
import { useBankBalance, useTerraNativeLength } from "data/queries/bank"
import { readNativeDenom } from "data/token"
import { Card } from "components/layout"
import { Wrong } from "components/feedback"

interface MultipleSwap {
  available: TokenItemWithBalance[]
}

export const [useMultipleSwap, MultipleSwapProvider] =
  createContext<MultipleSwap>("useMultipleSwap")

const MultipleSwapContext = ({ children }: PropsWithChildren<{}>) => {
  const { t } = useTranslation()
  const isClassic = useIsClassic()
  const currency = useCurrency()
  const bankBalance = useBankBalance()
  const length = useTerraNativeLength()

  const denoms = sortCoins(bankBalance, currency)
    .map(({ denom }) => denom)
    .filter(isDenomTerraNative)

  const available = useMemo(() => {
    return denoms.map((denom) => {
      const balance = getAmount(bankBalance, denom)
      return { ...readNativeDenom(denom, isClassic), balance }
    })
  }, [bankBalance, denoms, isClassic])

  const render = () => {
    if (length < 2)
      return <Wrong>{t("Multiple swap requires at least 2 coins")}</Wrong>

    if (!available) return null

    return (
      <MultipleSwapProvider value={{ available }}>
        {children}
      </MultipleSwapProvider>
    )
  }

  return <Card>{render()}</Card>
}

export default MultipleSwapContext
