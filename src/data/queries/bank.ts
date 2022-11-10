import { useQuery } from "react-query"
import axios from "axios"
import { isDenomTerraNative } from "@terra.kitchen/utils"
import { Coins } from "@terra-money/terra.js"
import createContext from "utils/createContext"
import { queryKey, RefetchOptions } from "../query"
import { useNetwork } from "../wallet"
import { useInterchainLCDClient, useLCDClient } from "./lcdClient"
import { useInterchainAddresses } from "auth/hooks/useAddress"
import { Coin } from "@terra-money/station.js"

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
  createContext<Coins>("useBankBalance")

export const useInitialBankBalance = () => {
  const addresses = useInterchainAddresses()
  const lcd = useInterchainLCDClient()

  return useQuery(
    [queryKey.bank.balance, addresses],
    async () => {
      if (!addresses.length) return new Coins()
      // TODO: Pagination
      // Required when the number of results exceed 100
      const balances = await Promise.all(
        addresses.map((address) => lcd.bank.balance(address))
      )
      console.log(balances)
      return new Coins([
        ...balances.reduce(
          (acc, balance) => acc.concat(balance[0].toArray()),
          [] as Coin[]
        ),
      ])
    },
    { ...RefetchOptions.DEFAULT }
  )
}

export const useBalances = () => {
  const addresses = useInterchainAddresses()
  const lcd = useLCDClient()

  return useQuery(
    [queryKey.bank.balances, addresses],
    async () => {
      if (!addresses.length) return new Coins()

      const balances = await Promise.all(
        // TODO: Pagination
        // Required when the number of results exceed 100
        addresses.map((address) => lcd.bank.balance(address))
      )
      console.log(balances)
      return new Coins([
        ...balances.reduce(
          (acc, balance) => acc.concat(balance[0].toArray()),
          [] as Coin[]
        ),
      ])
    },
    { ...RefetchOptions.DEFAULT }
  )
}

export const useTerraNativeLength = () => {
  const bankBalance = useBankBalance()
  return bankBalance?.toArray().filter(({ denom }) => isDenomTerraNative(denom))
    .length
}

export const useIsWalletEmpty = () => {
  const length = useTerraNativeLength()
  return !length
}
