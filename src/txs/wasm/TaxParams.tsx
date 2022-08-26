import { FC } from "react"
import { zipObj } from "ramda"
import { Coin } from "@terra-money/terra.js"
import createContext from "utils/createContext"
import { combineState } from "data/query"
import { useBankBalance } from "data/queries/bank"
import { useTaxCaps, useTaxRate } from "data/queries/treasury"
import { TaxParams } from "../utils"

export const [useTaxParams, TaxParamsProvider] =
  createContext<TaxParams>("useTaxParams")

  interface Props {
    children: React.ReactNode
  }

const TaxParamsContext: FC<Props> = ({ children }) => {
  const bankBalance = useBankBalance()
  const denoms = bankBalance.toArray().map(({ denom }: Coin) => denom) ?? []
  const { data: taxRate, ...taxRateState } = useTaxRate()
  const taxCapsState = useTaxCaps(denoms)
  const state = combineState(taxRateState, ...taxCapsState)

  if (!state.isSuccess || !taxRate) return null

  // TODO: Review before PR
  const taxCaps = zipObj(
    denoms,
    taxCapsState.map(({ data }) => data)
  )

  return (
    <TaxParamsProvider value={{ taxRate, taxCaps }}>
      {children}
    </TaxParamsProvider>
  )
}

export default TaxParamsContext
