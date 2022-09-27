import { PropsWithChildren } from "react"
import { zipObj } from "ramda"
import { Coin } from "@terra-money/terra.js"
import createContext from "utils/createContext"
import { useIsClassic } from "data/query"
import { useBankBalance } from "data/queries/bank"
import { useTaxCaps, useTaxRate } from "data/queries/treasury"
import { TaxParams } from "../utils"

export const [useTaxParams, TaxParamsProvider] =
  createContext<TaxParams>("useTaxParams")

const TaxParamsContext = ({ children }: PropsWithChildren<{}>) => {
  const bankBalance = useBankBalance()
  const denoms = bankBalance.toArray().map(({ denom }: Coin) => denom) ?? []
  const { data: taxRate } = useTaxRate(!useIsClassic()) || "0"
  const taxCapsState = useTaxCaps(denoms)

  const taxCaps = zipObj(
    denoms,
    taxCapsState.map(({ data }) => {
      return data
    })
  )

  return (
    <TaxParamsProvider value={{ taxRate, taxCaps } as TaxParams}>
      {children}
    </TaxParamsProvider>
  )
}

export default TaxParamsContext
