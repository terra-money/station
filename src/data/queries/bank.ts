import { useQuery } from "react-query"
import axios from "axios"
import createContext from "utils/createContext"
import { queryKey, RefetchOptions } from "../query"
import { useNetwork } from "../wallet"
import { useInterchainLCDClient, useLCDClient } from "./lcdClient"
import { useInterchainAddresses } from "auth/hooks/useAddress"

export const useSupply = () => {
  const { lcd } = useNetwork()

  return useQuery(
    [queryKey.bank.supply],
    async () => {
      // FIXME: Import from terra.js
      const { data } = await axios.get<{ supply: CoinData[] }>(
        "cosmos/bank/v1beta1/supply",
        {
          baseURL: lcd,
          params: {
            "pagination.reverse": "true",
          },
        }
      )

      return data.supply
    },
    { ...RefetchOptions.INFINITY }
  )
}

// As a wallet app, native token balance is always required from the beginning.
export const [useBankBalance, BankBalanceProvider] =
  createContext<CoinBalance[]>("useBankBalance")

export const useInitialBankBalance = () => {
  const addresses = useInterchainAddresses()
  const lcd = useInterchainLCDClient()

  return useQuery(
    [queryKey.bank.balances, addresses],
    async () => {
      const chains = Object.keys(addresses)

      if (!chains.length) return [] as CoinBalance[]
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

interface CoinBalance {
  amount: string
  denom: string
  chain: string
}

export const useBalances = () => {
  const addresses = useInterchainAddresses()
  const lcd = useLCDClient()

  return useQuery(
    [queryKey.bank.balances, addresses],
    async () => {
      const chains = Object.keys(addresses)

      if (!chains.length) return [] as CoinBalance[]
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
  // check if wallet has uluna
  return !bankBalance.length
}
