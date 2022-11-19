import { useQuery } from "react-query"
import axios from "axios"
import createContext from "utils/createContext"
import { queryKey, RefetchOptions } from "../query"
import { useNetwork } from "../wallet"
import { useInterchainLCDClient, useLCDClient } from "./lcdClient"
import { useInterchainAddresses } from "auth/hooks/useAddress"
import { useCustomTokensCW20 } from "data/settings/CustomTokens"
import { useChains } from "./chains"

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

export const useInitialTokenBalance = () => {
  const addresses = useInterchainAddresses()
  const chains = useChains()
  const lcd = useInterchainLCDClient()
  const { list: cw20 } = useCustomTokensCW20()

  return useQuery(
    [queryKey.bank.balances, addresses, cw20, chains],
    async () => {
      return (await Promise.all(
        cw20.map(async ({ token }) => {
          const chainID =
            Object.values(chains).find(({ prefix }) => token.startsWith(prefix))
              ?.chainID ?? ""

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
