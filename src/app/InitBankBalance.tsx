import { PropsWithChildren } from "react"
import {
  CoinBalance,
  useInitialBankBalance,
  useInitialTokenBalance,
} from "data/queries/bank"
import { BankBalanceProvider } from "data/queries/bank"
//import { useNetworkName } from "data/wallet"
import { combineState } from "data/query"
import { WithFetching } from "components/feedback"
//import { useCustomTokensNative } from "data/settings/CustomTokens"
//import { useWhitelist } from "data/queries/chains"

const InitBankBalance = ({ children }: PropsWithChildren<{}>) => {
  const balances = useInitialBankBalance()
  const tokenBalancesQuery = useInitialTokenBalance()
  //const native = useCustomTokensNative()
  //const { whitelist } = useWhitelist()

  //const networkName = useNetworkName()

  const state = combineState(...balances, ...tokenBalancesQuery)
  const bankBalance = balances.reduce(
    (acc, { data }) => (data ? [...acc, ...data] : acc),
    [] as CoinBalance[]
  )
  const tokenBalance: CoinBalance[] = tokenBalancesQuery.reduce(
    (acc, { data }) => (data ? [...acc, data] : acc),
    [] as CoinBalance[]
  )

  /*native.list.forEach(({ denom }) => {
    if (!bankBalance.find((balance) => balance.denom === denom)) {
      const token = whitelist[networkName][denom]

      if (!token || !token.chains || token.chains.length === 0) return

      bankBalance.push({
        denom,
        amount: "0",
        chain: token.chains[0],
      })
    }
  })*/

  return (
    <BankBalanceProvider value={[...bankBalance, ...tokenBalance]}>
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
