import { useCallback, useMemo } from "react"
import { useQuery } from "react-query"
import BigNumber from "bignumber.js"
import * as anchor from "@anchor-protocol/anchor.js"
import { readAmount, toAmount } from "@terra.kitchen/utils"
import { Coins } from "@terra-money/terra.js"
import { has } from "utils/num"
import { getAmount } from "utils/coin"
import { AnchorEarnAction } from "txs/earn/AnchorEarnForm"
import { queryKey, RefetchOptions } from "../query"
import { useAddress, useNetworkName } from "../wallet"
import { useLCDClient } from "../Terra/lcdClient"

const {
  AddressProviderFromJson,
  columbus5,
  Earn,
  fabricateMarketDepositStableCoin,
  fabricateMarketRedeemStable,
  MARKET_DENOMS,
  queryMarketEpochState,
  bombay12,
} = anchor

const market = MARKET_DENOMS.UUSD

const useAddressProvider = () => {
  const name = useNetworkName()

  const provider = useMemo(() => {
    const addresses = { mainnet: columbus5, testnet: bombay12 }[name]
    if (!addresses) throw new Error(`Anchor is not supported: ${name}`)
    return new AddressProviderFromJson(addresses)
  }, [name])

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

export const useAnchorGetMsgs = (rate: string) => {
  const address = useAddress()
  const addressProvider = useAddressProvider()

  const getMsgs = useCallback(
    (value: string, type: AnchorEarnAction) => {
      if (!address) return
      if (!has(value)) throw new Error(`Anchor tx: Invalid amount ${value}`)

      const amount = {
        [AnchorEarnAction.DEPOSIT]: readAmount(value),
        [AnchorEarnAction.WITHDRAW]: readAmount(
          new BigNumber(value).div(rate).toString()
        ),
      }[type]

      const params = { address, amount, market }

      return {
        [AnchorEarnAction.DEPOSIT]:
          fabricateMarketDepositStableCoin(params)(addressProvider),
        [AnchorEarnAction.WITHDRAW]:
          fabricateMarketRedeemStable(params)(addressProvider),
      }[type]
    },
    [address, addressProvider, rate]
  )

  return getMsgs
}

/* helpers */
export const getAvailableAnchorEarnActions = (
  deposit: Amount,
  bankBalance: Coins
) => {
  return {
    [AnchorEarnAction.DEPOSIT]: has(getAmount(bankBalance, "uusd")),
    [AnchorEarnAction.WITHDRAW]: has(deposit),
  }
}
