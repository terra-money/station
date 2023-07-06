import { useQueries, useQuery } from "react-query"
import createContext from "utils/createContext"
import { queryKey, RefetchOptions } from "../query"
import { useInterchainLCDClient } from "./lcdClient"
import { useInterchainAddresses } from "auth/hooks/useAddress"
import { useCustomTokensCW20 } from "data/settings/CustomTokens"
import { useNetwork } from "data/wallet"
import { getChainIDFromAddress } from "utils/bech32"

export const useInitialTokenBalance = () => {
  const addresses = useInterchainAddresses()
  const networks = useNetwork()
  const lcd = useInterchainLCDClient()
  const { list: cw20 } = useCustomTokensCW20()

  return useQueries(
    cw20.map(({ token }) => {
      const chainID = getChainIDFromAddress(token, networks)
      const address = chainID && addresses?.[chainID]
      return {
        queryKey: [queryKey.bank.balances, token, chainID, address],
        queryFn: async () => {
          if (!address)
            return {
              amount: "0",
              denom: token,
              chain: chainID,
            } as CoinBalance

          const { balance } = await lcd.wasm.contractQuery<{ balance: Amount }>(
            token,
            { balance: { address } }
          )

          return {
            amount: balance,
            denom: token,
            chain: chainID,
          } as CoinBalance
        },
        ...RefetchOptions.DEFAULT,
      }
    })
  )
}

// As a wallet app, native token balance is always required from the beginning.
export const [useBankBalance, BankBalanceProvider] =
  createContext<CoinBalance[]>("useBankBalance")

export const useInitialBankBalance = () => {
  const lcd = useInterchainLCDClient()
  const addresses = useInterchainAddresses()

  return useQueries(
    Object.entries(addresses ?? {}).map(([chainID, address]) => {
      return {
        queryKey: [queryKey.bank.balances, address, chainID],
        queryFn: async () => {
          const bal = ["phoenix-1", "pisco-1"].includes(chainID)
            ? await lcd.bank.spendableBalances(address)
            : await lcd.bank.balance(address)

          return bal[0].toArray().map(({ denom, amount }) => ({
            denom,
            amount: amount.toString(),
            chain: chainID,
          })) as CoinBalance[]
        },
        disabled: !address,
        ...RefetchOptions.DEFAULT,
      }
    })
  )
}

export interface CoinBalance {
  amount: string
  denom: string
  chain: string
}

export const useBalances = () => {
  const addresses = useInterchainAddresses()
  const lcd = useInterchainLCDClient()

  return useQuery(
    [queryKey.bank.balances, addresses],
    async () => {
      if (!addresses) return [] as CoinBalance[]
      const chains = Object.keys(addresses ?? {})

      // TODO: Pagination
      // Required when the number of results exceed 100
      const balances = await Promise.all(
        chains.map((chain) => lcd.bank.balance(addresses[chain]))
      )

      const result = [] as CoinBalance[]
      chains.forEach((chain, i) => {
        balances[i][0].toArray().forEach(({ denom, amount }) =>
          result.push({
            denom,
            amount: amount.toString(),
            chain,
          })
        )
      })
      return result
    },
    { ...RefetchOptions.DEFAULT }
  )
}

export const useIsWalletEmpty = () => {
  const bankBalance = useBankBalance()
  return !bankBalance.length
}
