import { PropsWithChildren } from "react"
import {
  useInitialBankBalance,
  useInitialTokenBalance,
} from "data/queries/bank"
import { BankBalanceProvider } from "data/queries/bank"
import NetworkLoading from "./NetworkLoading"

const InitBankBalance = ({ children }: PropsWithChildren<{}>) => {
  const { data: bankBalance } = useInitialBankBalance()
  const { data: tokenBalance } = useInitialTokenBalance()
  // If the balance doesn't exist, nothing is worth rendering.
  if (!bankBalance) return <NetworkLoading title="Fetching balances..." />
  return (
    <BankBalanceProvider value={[...bankBalance, ...(tokenBalance ?? [])]}>
      {children}
    </BankBalanceProvider>
  )
}

export default InitBankBalance
