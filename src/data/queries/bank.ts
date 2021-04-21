import { useQuery } from "react-query"
import axios from "axios"
import { isDenomTerraNative } from "@terra.kitchen/utils"
import { Coins } from "@terra-money/terra.js"
import createContext from "utils/createContext"
import { queryKey, RefetchOptions } from "../query"
import { useAddress, useNetwork } from "../wallet"
import { useLCDClient } from "../Terra/lcdClient"

export const useSupply = () => {
  const { lcd } = useNetwork()

  return useQuery(
    [queryKey.bank.supply],
    async () => {
      // TODO: Pagination
      // Required when the number of results exceed 100
      const { data } = await axios.get<{ supply: CoinData[] }>(
        "cosmos/bank/v1beta1/supply", // FIXME: Import from terra.js
        { baseURL: lcd }
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
  const address = useAddress()
  const lcd = useLCDClient()

  return useQuery(
    [queryKey.bank.balance, address],
    async () => {
      if (!address) return new Coins()
      // TODO: Pagination
      // Required when the number of results exceed 100
      const [coins] = await lcd.bank.balance(address)
      return coins
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
