import { useQuery } from "react-query"
import BigNumber from "bignumber.js"
import {
  AccAddress,
  Coin,
  Coins,
  Rewards,
  ValAddress,
  Validator,
} from "@terra-money/feather.js"
import { has } from "utils/num"
import { sortCoins } from "utils/coin"
import { queryKey, RefetchOptions } from "../query"
import { useAddress } from "../wallet"
import { useInterchainLCDClient } from "./lcdClient"
import { CalcValue } from "./coingecko"
import { useInterchainAddressesWithFeature } from "auth/hooks/useAddress"
import { ChainFeature } from "types/chains"

export const useRewards = (chainID?: string) => {
  const addresses = useInterchainAddressesWithFeature(ChainFeature.STAKING)
  const lcd = useInterchainLCDClient()

  return useQuery(
    [queryKey.distribution.rewards, addresses, chainID],
    async () => {
      if (!addresses) return { total: new Coins(), rewards: {} }

      if (chainID) {
        return await lcd.distribution.rewards(addresses[chainID])
      } else {
        const results = await Promise.all(
          Object.values(addresses ?? {}).map((address) =>
            lcd.distribution.rewards(address as string)
          )
        )
        let total: Coin.Data[] = []
        let rewards = {}

        results.forEach((result) => {
          total = [...total, ...result.total.toData()]
          rewards = { ...rewards, ...result.rewards }
        })

        return { total: Coins.fromData(total), rewards }
      }
    },
    { ...RefetchOptions.DEFAULT }
  )
}

export const useCommunityPool = (chain: string) => {
  const lcd = useInterchainLCDClient()

  return useQuery(
    [queryKey.distribution.communityPool, chain],
    () => lcd.distribution.communityPool(chain),
    { ...RefetchOptions.INFINITY }
  )
}

/* commission */
// TODO: make interchain
export const useValidatorCommission = () => {
  const lcd = useInterchainLCDClient()
  const address = useAddress()

  return useQuery(
    [queryKey.distribution.validatorCommission],
    async () => {
      if (!address) return new Coins()
      const validatorAddress = ValAddress.fromAccAddress(
        address,
        AccAddress.getPrefix(address)
      )
      return await lcd.distribution.validatorCommission(validatorAddress)
    },
    { ...RefetchOptions.DEFAULT }
  )
}

// TODO: make interchain
export const useWithdrawAddress = () => {
  const lcd = useInterchainLCDClient()
  const address = useAddress()

  return useQuery(
    [queryKey.distribution.withdrawAddress],
    async () => {
      if (!address) return
      return await lcd.distribution.withdrawAddress(address)
    },
    { ...RefetchOptions.DEFAULT }
  )
}

/* hooks */
export const getConnectedMoniker = (
  address?: string,
  validators?: Validator[]
) => {
  if (!(address && validators)) return

  const validatorAddress = ValAddress.fromAccAddress(
    address,
    AccAddress.getPrefix(address)
  )
  const validator = validators.find(
    ({ operator_address }) => operator_address === validatorAddress
  )

  if (!validator) return

  return validator.description.moniker
}

/* helpers */
export const calcRewardsValues = (
  rewards: Rewards,
  currency: Denom,
  calcValue: CalcValue
) => {
  const calc = (coins: Coins) => {
    const list = sortCoins(coins, currency).filter(({ amount }) => has(amount))
    const sum = BigNumber.sum(
      ...list.map((item) => calcValue(item) ?? 0)
    ).toString()
    return { sum, list }
  }

  const total = calc(rewards.total)
  const byValidator = Object.entries(rewards.rewards ?? {})
    .map(([address, coins]) => ({ ...calc(coins), address }))
    .filter(({ list }) => has(list.length))
    .sort(({ sum: a }, { sum: b }) => Number(b) - Number(a))

  return { total, byValidator }
}

export const calcRewardsValuesForChain = (
  rewards: Rewards | undefined,
  currency: Denom
) => {
  if (!rewards) return []
  return sortCoins(rewards?.total, currency).filter(({ amount }) => {
    return has(amount)
  })
}
