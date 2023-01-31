import { PropsWithChildren } from "react"
import {
  CoinBalance,
  useInitialBankBalance,
  useInitialTokenBalance,
} from "data/queries/bank"
import { BankBalanceProvider } from "data/queries/bank"
import { useChainID } from "data/wallet"
import { combineState } from "data/query"
import { WithFetching } from "components/feedback"

const InitBankBalance = ({ children }: PropsWithChildren<{}>) => {
  const balances = useInitialBankBalance()
  const { data: tokenBalance } = useInitialTokenBalance()
  const chainID = useChainID()

  const DEFAULT_COIN = {
    denom: "uluna",
    amount: "0",
    chain: chainID,
  }

  const state = combineState(...balances)
  const bankBalance = balances.reduce(
    (acc, { data }) => (data ? [...acc, ...data] : acc),
    [] as CoinBalance[]
  )

  if (!bankBalance.find(({ denom }) => denom === "uluna")) {
    bankBalance.push(DEFAULT_COIN)
  }

  return (
    <BankBalanceProvider value={[...bankBalance, ...(tokenBalance ?? [])]}>
      <WithFetching {...state}>
        {(progress) => (
          <>
            {progress}
            {children}
          </>
        )}
      </WithFetching>
    </BankBalanceProvider>
  )
}

export default InitBankBalance
