import { PropsWithChildren } from "react"
import { useInitialBankBalance } from "data/queries/bank"
import { BankBalanceProvider } from "data/queries/bank"

const InitBankBalance = ({ children }: PropsWithChildren<{}>) => {
  const { data: bankBalance } = useInitialBankBalance()
  // If the balance doesn't exist, nothing is worth rendering.
  if (!bankBalance) return null
  return (
    <BankBalanceProvider value={bankBalance}>{children}</BankBalanceProvider>
  )
}

export default InitBankBalance
