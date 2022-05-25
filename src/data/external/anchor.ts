/*
 * @Author: lmk
 * @Date: 2022-05-25 11:23:10
 * @LastEditTime: 2022-05-25 17:16:15
 * @LastEditors: lmk
 * @Description:
 */
import { useMemo } from "react"
import { useQuery } from "react-query"
import * as anchor from "@anchor-protocol/anchor.js"
import { toAmount } from "@terra.kitchen/utils"
import { queryKey, RefetchOptions } from "../query"
import { useAddress, useNetworkName } from "../wallet"
import { useLCDClient } from "../queries/lcdClient"

const {
  AddressProviderFromJson,
  columbus5,
  Earn,
  MARKET_DENOMS,
  queryMarketEpochState,
  bombay12,
} = anchor

const market = MARKET_DENOMS.UUSD

const useAddresses = () => {
  const name = useNetworkName()
  return useMemo(
    () => ({ mainnet: columbus5, testnet: bombay12 }[name]),
    [name]
  )
}

export const useIsAnchorAvailable = () => {
  const addresses = useAddresses()
  return !!addresses
}

const useAddressProvider = () => {
  const addresses = useAddresses()

  const provider = useMemo(() => {
    if (!addresses) throw new Error(`Anchor is not supported`)
    return new AddressProviderFromJson(addresses)
  }, [addresses])

  return provider
}

const useAnchorEarn = () => {
  const lcd = useLCDClient()
  const addressProvider = useAddressProvider()

  const earn = useMemo(() => {
    return new Earn(lcd, addressProvider)
  }, [lcd, addressProvider])

  return earn
}

/* queries */
export const useAnchorTotalDeposit = () => {
  const earn = useAnchorEarn()
  const address = useAddress()

  return useQuery(
    [queryKey.Anchor.TotalDeposit, address],
    async () => {
      if (!address) return "0"
      const deposit = await earn.getTotalDeposit({ address, market })
      return toAmount(deposit)
    },
    { ...RefetchOptions.DEFAULT }
  )
}

export const useAnchorAPY = () => {
  const earn = useAnchorEarn()
  return useQuery([queryKey.Anchor.APY], () => earn.getAPY({ market }), {
    ...RefetchOptions.INFINITY,
  })
}

export const useAnchorExchangeRate = () => {
  const lcd = useLCDClient()
  const addressProvider = useAddressProvider()

  return useQuery(
    [queryKey.Anchor.MarketEpochState],
    async () => {
      const { exchange_rate } = await queryMarketEpochState({ lcd, market })(
        addressProvider
      )

      return exchange_rate
    },
    { ...RefetchOptions.DEFAULT }
  )
}
