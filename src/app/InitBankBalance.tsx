import { FC } from "react"
import { useInitialBankBalance } from "data/queries/bank"
import { BankBalanceProvider } from "data/queries/bank"

const InitBankBalance: FC = ({ children }) => {
  const { data: bankBalance } = useInitialBankBalance()
  // If the balance doesn't exist, nothing is worth rendering.
  if (!bankBalance) return null
  return (
    <BankBalanceProvider value={bankBalance}>{children}</BankBalanceProvider>
  )
}

export default InitBankBalance
