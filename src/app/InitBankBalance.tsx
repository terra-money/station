import { PropsWithChildren } from "react"
import {
  useInitialBankBalance,
  useInitialTokenBalance,
} from "data/queries/bank"
import { BankBalanceProvider } from "data/queries/bank"

const InitBankBalance = ({ children }: PropsWithChildren<{}>) => {
  const { data: bankBalance } = useInitialBankBalance()
  const { data: tokenBalance } = useInitialTokenBalance()
  // If the balance doesn't exist, nothing is worth rendering.
  if (!bankBalance) return null
  return (
    <BankBalanceProvider value={[...bankBalance, ...(tokenBalance ?? [])]}>
      {children}
    </BankBalanceProvider>
  )
}

export default InitBankBalance
