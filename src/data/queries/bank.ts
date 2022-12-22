import { useQuery } from "react-query"
import createContext from "utils/createContext"
import { queryKey, RefetchOptions } from "../query"
import { useInterchainLCDClient } from "./lcdClient"
import { useInterchainAddresses } from "auth/hooks/useAddress"
import { useCustomTokensCW20 } from "data/settings/CustomTokens"
import { useNetwork } from "data/wallet"

export const useInitialTokenBalance = () => {
  const addresses = useInterchainAddresses()
  const networks = useNetwork()
  const lcd = useInterchainLCDClient()
  const { list: cw20 } = useCustomTokensCW20()

  return useQuery(
    [queryKey.bank.balances, addresses, cw20, networks],
    async () => {
      return (await Promise.all(
        cw20.map(async ({ token }) => {
          const chainID =
            Object.values(networks).find(({ prefix }) =>
              token.startsWith(prefix)
            )?.chainID ?? ""

          const address = addresses?.[chainID]
          if (!address)
            return {
              amount: "0",
              denom: token,
              chain: chainID,
            }
          const { balance } = await lcd.wasm.contractQuery<{ balance: Amount }>(
            token,
            { balance: { address } }
          )
          return {
            amount: balance,
            denom: token,
            chain: chainID,
          }
        })
      )) as CoinBalance[]
    },
    { ...RefetchOptions.DEFAULT }
  )
}

// As a wallet app, native token balance is always required from the beginning.
export const [useBankBalance, BankBalanceProvider] =
  createContext<CoinBalance[]>("useBankBalance")

export const useInitialBankBalance = () => {
  const lcd = useInterchainLCDClient()
  const addresses = useInterchainAddresses()

  return useQuery(
    [queryKey.bank.balances, addresses],
    async () => {
      if (!addresses)
        return [
          { denom: "uluna", amount: "0", chain: "phoenix-1" },
        ] as CoinBalance[]
      const chains = Object.keys(addresses)

      // TODO: Pagination
      // Required when the number of results exceed 100
      const balances = await Promise.all(
        chains.map((chain) => {
          return lcd.bank.balance(addresses[chain])
        })
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

      if (!result.find(({ denom }) => denom === "uluna")) {
        result.push({ denom: "uluna", amount: "0", chain: "phoenix-1" })
      }

      return result
    },
    { ...RefetchOptions.DEFAULT }
  )
}

interface CoinBalance {
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
      const chains = Object.keys(addresses)

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
