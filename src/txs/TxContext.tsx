import { FC } from "react"
import createContext from "utils/createContext"
import { GasPrices, useGasPrices } from "data/Terra/TerraAPI"
import { useTxKey } from "./Tx"

export const [useTx, TxProvider] =
  createContext<{ gasPrices: GasPrices }>("useTx")

const TxContext: FC = ({ children }) => {
  const txKey = useTxKey()
  const { data: gasPrices } = useGasPrices()

  // If the gas prices doesn't exist, nothing is worth rendering.
  if (!gasPrices) return null

  return (
    <TxProvider value={{ gasPrices }} key={txKey}>
      {children}
    </TxProvider>
  )
}

export default TxContext
