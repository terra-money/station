import { useQuery, useQueries, UseQueryResult } from "react-query"
import { flatten, path, uniqBy } from "ramda"
import BigNumber from "bignumber.js"
import { AccAddress, ValAddress, Validator } from "@terra-money/terra.js"
import { Delegation, UnbondingDelegation } from "@terra-money/terra.js"
/* FIXME(terra.js): Import from terra.js */
import { BondStatus } from "@terra-money/terra.proto/cosmos/staking/v1beta1/staking"
import { has } from "utils/num"
import { StakeAction } from "txs/stake/StakeForm"
import { queryKey, Pagination, RefetchOptions } from "../query"
import { useAddress } from "../wallet"
import { useInterchainLCDClient, useLCDClient } from "./lcdClient"
import { useInterchainAddresses } from "auth/hooks/useAddress"
import { readAmount } from "@terra.kitchen/utils"
import { useMemoizedPrices } from "data/queries/coingecko"
import { useNativeDenoms } from "data/token"

export const useValidators = () => {
  const lcd = useLCDClient()

  return useQuery(
    [queryKey.staking.validators],
    async () => {
      // TODO: Pagination
      // Required when the number of results exceed LAZY_LIMIT

      const [v1] = await lcd.staking.validators({
        status: BondStatus[BondStatus.BOND_STATUS_UNBONDED],
        ...Pagination,
      })

      const [v2] = await lcd.staking.validators({
        status: BondStatus[BondStatus.BOND_STATUS_UNBONDING],
        ...Pagination,
      })

      const [v3] = await lcd.staking.validators({
        status: BondStatus[BondStatus.BOND_STATUS_BONDED],
        ...Pagination,
      })

      return uniqBy(path(["operator_address"]), [...v1, ...v2, ...v3])
    },
    { ...RefetchOptions.INFINITY }
  )
}

export const useInterchainDelegations = () => {
  const addresses = useInterchainAddresses() || {}
  const lcd = useInterchainLCDClient()

  return useQueries(
    Object.keys(addresses).map((chainName) => {
      return {
        queryKey: ["interchainDelegations", addresses[chainName]],
        queryFn: async () => {
          const [delegations] = await lcd.staking.delegations(
            addresses[chainName],
            undefined,
            Pagination
          )

          const delegation = delegations.filter(
            ({ balance }: { balance: any }) => {
              return has(balance.amount.toString())
            }
          )

          return { delegation, chainName }
        },
      }
    })
  )
}

export const useValidator = (operatorAddress: ValAddress) => {
  const lcd = useLCDClient()
  return useQuery(
    [queryKey.staking.validator, operatorAddress],
    () => lcd.staking.validator(operatorAddress),
    { ...RefetchOptions.INFINITY }
  )
}

export const useDelegations = () => {
  const address = useAddress()
  const lcd = useLCDClient()

  return useQuery(
    [queryKey.staking.delegations, address],
    async () => {
      if (!address) return []
      // TODO: Pagination
      // Required when the number of results exceed LAZY_LIMIT
      const [delegations] = await lcd.staking.delegations(
        address,
        undefined,
        Pagination
      )

      return delegations.filter(({ balance }) => has(balance.amount.toString()))
    },
    { ...RefetchOptions.DEFAULT }
  )
}

export const useDelegation = (validatorAddress: ValAddress) => {
  const address = useAddress()
  const lcd = useLCDClient()

  return useQuery(
    [queryKey.staking.delegation, address, validatorAddress],
    async () => {
      if (!address) return
      try {
        const delegation = await lcd.staking.delegation(
          address,
          validatorAddress
        )
        return delegation
      } catch {
        return
      }
    },
    { ...RefetchOptions.DEFAULT }
  )
}

export const useUnbondings = () => {
  const address = useAddress()
  const lcd = useLCDClient()

  return useQuery(
    [queryKey.staking.unbondings, address],
    async () => {
      if (!address) return []
      // Pagination is not required because it is already limited
      const [unbondings] = await lcd.staking.unbondingDelegations(address)
      return unbondings
    },
    { ...RefetchOptions.DEFAULT }
  )
}

export const useStakingPool = (chain: string) => {
  const lcd = useInterchainLCDClient()
  return useQuery([queryKey.staking.pool], () => lcd.staking.pool(chain), {
    ...RefetchOptions.INFINITY,
  })
}

/* helpers */
export const getFindValidator = (validators: Validator[]) => {
  return (address: AccAddress) => {
    const validator = validators.find((v) => v.operator_address === address)
    if (!validator) throw new Error(`${address} is not a validator`)
    return validator
  }
}

export const getFindMoniker = (validators: Validator[]) => {
  return (address: AccAddress) => {
    const validator = getFindValidator(validators)(address)
    return validator.description.moniker
  }
}

export const getAvailableStakeActions = (
  destination: ValAddress,
  delegations: Delegation[]
) => {
  return {
    [StakeAction.DELEGATE]: true,
    [StakeAction.REDELEGATE]:
      delegations.filter(
        ({ validator_address }) => validator_address !== destination
      ).length > 0,
    [StakeAction.UNBOND]: !!delegations.filter(
      ({ validator_address }) => validator_address === destination
    ).length,
  }
}

/* delegation */
export const calcDelegationsTotal = (delegations: Delegation[]) => {
  return delegations.length
    ? BigNumber.sum(
        ...delegations.map(({ balance }) => balance.amount.toString())
      ).toString()
    : "0"
}

export const useCalcInterchainDelegationsTotal = (
  delegationsQueryResults: UseQueryResult<{
    delegation: Delegation[]
    chainName: string
  }>[]
) => {
  const { data: prices } = useMemoizedPrices()
  const readNativeDenom = useNativeDenoms()

  if (!delegationsQueryResults.length)
    return { currencyTotal: 0, tableData: {} }

  const delegationsByDemon = {} as any
  const delegationsByChain = {} as any
  const delegationsAmountsByDemon = {} as any
  let currencyTotal = 0

  delegationsQueryResults.forEach((result) => {
    if (result.status === "success") {
      currencyTotal += result.data?.delegation?.length
        ? BigNumber.sum(
            ...result.data.delegation.map(({ balance }) => {
              const amount = BigNumber.sum(
                delegationsAmountsByDemon[balance.denom] || 0,
                balance.amount.toNumber()
              ).toNumber()

              const { token, decimals } = readNativeDenom(balance.denom)
              const currecyPrice: any =
                (amount * (prices?.[token]?.price || 0)) / 10 ** decimals

              delegationsByDemon[balance.denom] = currecyPrice
              delegationsAmountsByDemon[balance.denom] = amount

              if (!delegationsByChain[result.data.chainName]) {
                delegationsByChain[result.data.chainName] = {}
                delegationsByChain[result.data.chainName][balance.denom] = {
                  value: 0,
                  amount: 0,
                }
              }

              const chainSpecificAmount = BigNumber.sum(
                delegationsByChain[result.data.chainName][balance.denom]
                  ?.amount || 0,
                balance.amount.toNumber()
              ).toNumber()

              const chainSpecificCurrecyPrice: any =
                (chainSpecificAmount * (prices?.[token]?.price || 0)) /
                10 ** decimals

              delegationsByChain[result.data.chainName][balance.denom] = {
                value: chainSpecificCurrecyPrice,
                amount: chainSpecificAmount,
              }

              return currecyPrice
            })
          ).toNumber()
        : 0
    }
  })

  const tableDataByChain = {} as any
  Object.keys(delegationsByChain).forEach((chainName) => {
    tableDataByChain[chainName] = Object.keys(
      delegationsByChain[chainName]
    ).map((denom) => {
      const { symbol, icon } = readNativeDenom(denom)
      return {
        name: symbol,
        value: delegationsByChain[chainName][denom].value,
        amount: readAmount(delegationsByChain[chainName][denom].amount, {}),
        icon,
      }
    })
  })

  const allData = Object.keys(delegationsByDemon).map((demonName) => {
    const { symbol, icon } = readNativeDenom(demonName)
    return {
      name: symbol,
      value: delegationsByDemon[demonName],
      amount: readAmount(delegationsAmountsByDemon[demonName], {}),
      icon,
    }
  })

  return { currencyTotal, graphData: { all: allData, ...tableDataByChain } }
}

/* unbonding */
export const calcUnbondingsTotal = (unbondings: UnbondingDelegation[]) => {
  return BigNumber.sum(
    ...unbondings.map(({ entries }) => sumEntries(entries))
  ).toString()
}

export const flattenUnbondings = (unbondings: UnbondingDelegation[]) => {
  return flatten(
    unbondings.map(({ validator_address, entries }) => {
      return entries.map((entry) => ({ ...entry, validator_address }))
    })
  ).sort((a, b) => a.completion_time.getTime() - b.completion_time.getTime())
}

export const sumEntries = (entries: UnbondingDelegation.Entry[]) =>
  BigNumber.sum(
    ...entries.map(({ initial_balance }) => initial_balance.toString())
  ).toString()
