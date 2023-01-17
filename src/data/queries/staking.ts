import { useQuery, useQueries, UseQueryResult } from "react-query"
import { flatten, path, uniqBy } from "ramda"
import BigNumber from "bignumber.js"
import {
  AccAddress,
  Coin,
  MsgDelegate,
  MsgUndelegate,
  StakingParams,
  ValAddress,
  Validator,
} from "@terra-money/feather.js"
import { Delegation, UnbondingDelegation } from "@terra-money/feather.js"
import { has } from "utils/num"
import { StakeAction } from "txs/stake/StakeForm"
import { queryKey, Pagination, RefetchOptions } from "../query"
import { useInterchainLCDClient } from "./lcdClient"
import { useInterchainAddresses } from "auth/hooks/useAddress"
import { readAmount, toAmount } from "@terra.kitchen/utils"
import { useMemoizedPrices } from "data/queries/coingecko"
import { useNativeDenoms } from "data/token"
import shuffle from "utils/shuffle"
import { getIsBonded } from "pages/stake/ValidatorsList"
import { getChainIdFromAddress } from "./chains"
import { useNetwork } from "data/wallet"

export const useInterchainValidators = () => {
  const addresses = useInterchainAddresses() || {}
  const lcd = useInterchainLCDClient()

  return useQueries(
    Object.keys(addresses).map((chainID) => {
      return {
        queryKey: [queryKey.interchain.staking.validators, addresses, chainID],
        queryFn: async () => {
          const result: Validator[] = []
          let key: string | null = ""

          do {
            // @ts-expect-error
            const [list, pagination] = await lcd.staking.validators(chainID, {
              "pagination.limit": "100",
              "pagination.key": key,
            })

            result.push(...list)
            key = pagination?.next_key
          } while (key)

          return uniqBy(path(["operator_address"]), result)
        },
      }
    })
  )
}

export const useValidators = (chainID: string) => {
  const lcd = useInterchainLCDClient()

  return useQuery(
    [queryKey.staking.validators, chainID],
    async () => {
      const result: Validator[] = []
      let key: string | null = ""

      do {
        // @ts-expect-error
        const [list, pagination] = await lcd.staking.validators(chainID, {
          "pagination.limit": "100",
          "pagination.key": key,
        })

        result.push(...list)
        key = pagination?.next_key
      } while (key)

      return uniqBy(path(["operator_address"]), result)
    },
    { ...RefetchOptions.INFINITY }
  )
}

export const useInterchainDelegations = () => {
  const addresses = useInterchainAddresses() || {}
  const lcd = useInterchainLCDClient()

  return useQueries(
    Object.keys(addresses).map((chainID) => {
      return {
        queryKey: [queryKey.interchain.staking.delegations, addresses, chainID],
        queryFn: async () => {
          const [delegations] = await lcd.staking.delegations(
            addresses[chainID],
            undefined,
            Pagination
          )

          const delegation = delegations.filter(
            ({ balance }: { balance: any }) => {
              return has(balance.amount.toString())
            }
          )

          return { delegation, chainID }
        },
      }
    })
  )
}

export const useValidator = (operatorAddress: ValAddress) => {
  const lcd = useInterchainLCDClient()
  return useQuery(
    [queryKey.staking.validator, operatorAddress],
    () => lcd.staking.validator(operatorAddress),
    { ...RefetchOptions.INFINITY }
  )
}

export const useStakingParams = (chainID: string) => {
  const lcd = useInterchainLCDClient()
  return useQuery(
    [queryKey.staking.params, chainID],
    () => lcd.staking.parameters(chainID),
    { ...RefetchOptions.INFINITY }
  )
}

export const getChainUnbondTime = (stakingParams: StakingParams) =>
  stakingParams?.unbonding_time / (60 * 60 * 24)

export const useDelegations = (chainID: string) => {
  const addresses = useInterchainAddresses()
  const lcd = useInterchainLCDClient()

  return useQuery(
    [queryKey.staking.delegations, addresses?.[chainID]],
    async () => {
      if (!addresses || !addresses[chainID]) return []
      // TODO: Pagination
      // Required when the number of results exceed LAZY_LIMIT
      const [delegations] = await lcd.staking.delegations(
        addresses[chainID],
        undefined,
        Pagination
      )

      return delegations.filter(({ balance }) => has(balance.amount.toString()))
    },
    { ...RefetchOptions.DEFAULT }
  )
}

export const useDelegation = (validatorAddress: ValAddress) => {
  const addresses = useInterchainAddresses()
  const lcd = useInterchainLCDClient()

  return useQuery(
    [queryKey.staking.delegation, addresses, validatorAddress],
    async () => {
      if (!addresses) return
      const prefix = ValAddress.getPrefix(validatorAddress)
      const address = Object.values(addresses).find(
        (a) => AccAddress.getPrefix(a as string) === prefix
      )
      if (!address) return
      try {
        const delegation = await lcd.staking.delegation(
          address as string,
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

export const useInterchainUnbondings = () => {
  const addresses = useInterchainAddresses() || {}
  const lcd = useInterchainLCDClient()

  return useQueries(
    Object.keys(addresses).map((chainID) => {
      return {
        queryKey: [queryKey.interchain.staking.unbondings, addresses, chainID],
        queryFn: async () => {
          const [unbondings] = await lcd.staking.unbondingDelegations(
            addresses[chainID]
          )
          return unbondings
        },
      }
    })
  )
}

export const useUnbondings = (chainID: string) => {
  const addresses = useInterchainAddresses()
  const lcd = useInterchainLCDClient()

  return useQuery(
    [queryKey.staking.unbondings, addresses, chainID],
    async () => {
      if (!addresses || !addresses[chainID]) return []
      // Pagination is not required because it is already limited
      const [unbondings] = await lcd.staking.unbondingDelegations(
        addresses[chainID]
      )
      return unbondings
    },
    { ...RefetchOptions.DEFAULT }
  )
}

export const useStakingPool = (chainID: string) => {
  const lcd = useInterchainLCDClient()
  return useQuery(
    [queryKey.staking.pool, chainID],
    () => lcd.staking.pool(chainID),
    {
      ...RefetchOptions.INFINITY,
    }
  )
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
  return (address: ValAddress) => {
    try {
      const validator = getFindValidator(validators)(address)
      return validator.description.moniker
    } catch {
      return address
    }
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
    chainID: string
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

              if (!delegationsByChain[result.data.chainID]) {
                delegationsByChain[result.data.chainID] = {}
                delegationsByChain[result.data.chainID][balance.denom] = {
                  value: 0,
                  amount: 0,
                }
              }

              const chainSpecificAmount = BigNumber.sum(
                delegationsByChain[result.data.chainID][balance.denom]
                  ?.amount || 0,
                balance.amount.toNumber()
              ).toNumber()

              const chainSpecificCurrecyPrice: any =
                (chainSpecificAmount * (prices?.[token]?.price || 0)) /
                10 ** decimals

              delegationsByChain[result.data.chainID][balance.denom] = {
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

interface DelegationsResult {
  currencyTotal: number
  graphData?: Record<
    string,
    {
      name: string
      value: number
      amount: number
      denom: string
      icon?: string
    }[]
  >
}

export const useCalcDelegationsByValidator = (
  delegationsQueryResults: UseQueryResult<{
    delegation: Delegation[]
    chainID: string
  }>[],
  interchainValidators: UseQueryResult<Validator[], unknown>[]
): DelegationsResult => {
  const { data: prices } = useMemoizedPrices()
  const readNativeDenom = useNativeDenoms()
  const networks = useNetwork()

  if (!delegationsQueryResults.length) return { currencyTotal: 0 }

  const delegationsPriceByDenom = {} as Record<string, number>
  const delegationsAmountsByDenom = {} as Record<string, number>
  const validatorByChain = {} as Record<
    string,
    Record<
      ValAddress,
      {
        value: number
        amount: number
        denom: string
      }
    >
  >
  const allValidatorByChain = {} as Record<string, Validator[]>
  let currencyTotal = 0

  delegationsQueryResults.forEach((result) => {
    if (result.status === "success") {
      currencyTotal += result.data?.delegation?.length
        ? BigNumber.sum(
            ...result.data.delegation.map(({ balance, validator_address }) => {
              const amount = BigNumber.sum(
                delegationsAmountsByDenom[balance.denom] ?? 0,
                balance.amount.toNumber()
              ).toNumber()

              const { token, decimals } = readNativeDenom(balance.denom)
              const currecyPrice =
                (amount * (prices?.[token]?.price || 0)) / 10 ** decimals

              delegationsPriceByDenom[balance.denom] = currecyPrice
              delegationsAmountsByDenom[balance.denom] = amount

              if (!validatorByChain[result.data.chainID]) {
                validatorByChain[result.data.chainID] = {}
              }

              const delegatorCurrecyPrice =
                (balance.amount.toNumber() * (prices?.[token]?.price || 0)) /
                10 ** decimals

              validatorByChain[result.data.chainID][validator_address] = {
                value: delegatorCurrecyPrice,
                amount: balance.amount.toNumber(),
                denom: balance.denom,
              }

              return currecyPrice
            })
          ).toNumber()
        : 0
    }
  })

  interchainValidators.forEach((response) => {
    if (response.status === "success") {
      const addressChainId =
        getChainIdFromAddress(response.data[0]?.operator_address, networks) ||
        ""
      allValidatorByChain[addressChainId] = response.data
    }
  })

  const tableDataByChain = {} as Record<string, {}>

  Object.keys(validatorByChain).forEach((chainName) => {
    const delegationsDataComplete = Object.keys(
      validatorByChain[chainName]
    ).map((validator) => {
      if (!allValidatorByChain[chainName]) {
        return undefined
      }
      const { description } = getFindValidator(allValidatorByChain[chainName])(
        validator
      )
      return {
        address: validator,
        moniker: description.moniker,
        identity: description.identity,
        value: validatorByChain[chainName][validator].value,
        amount: validatorByChain[chainName][validator].amount,
        denom: validatorByChain[chainName][validator].denom,
      }
    })

    const sortedValis = delegationsDataComplete.sort(
      (a, b) => (b?.value ?? 0) - (a?.value ?? 0)
    )
    if (sortedValis.length <= 4) {
      tableDataByChain[chainName] = sortedValis
    } else {
      const top4 = sortedValis.slice(0, 4)
      const other = {
        address: "Other",
        moniker: "Other",
        identity: "Other",
        value: sortedValis
          .slice(4)
          .reduce((acc, vali) => acc + (vali?.value ?? 0), 0),
        amount: sortedValis
          .slice(4)
          .reduce((acc, vali) => acc + Number(vali?.amount ?? 0), 0),
        denom: sortedValis[4]?.denom,
      }

      tableDataByChain[chainName] = [...top4, other]
    }
  })

  const allData = Object.keys(delegationsPriceByDenom).map((denom) => {
    const { symbol, icon } = readNativeDenom(denom)
    return {
      name: symbol,
      value: delegationsPriceByDenom[denom],
      amount: delegationsAmountsByDenom[denom],
      denom,
      icon,
    }
  })

  return { currencyTotal, graphData: { all: allData, ...tableDataByChain } }
}

/* Quick stake helpers */
export const getPriorityVals = (validators: Validator[]) => {
  const MAX_COMMISSION = 0.05
  const VOTE_POWER_INCLUDE = 0.65

  const totalStaked = getTotalStakedTokens(validators)
  const getVotePower = (v: Validator) => Number(v.tokens) / totalStaked

  return validators
    .sort((a, b) => getVotePower(a) - getVotePower(b)) // least to greatest
    .reduce(
      (acc, cur) => {
        acc.sumVotePower += getVotePower(cur)
        if (acc.sumVotePower < VOTE_POWER_INCLUDE) acc.elgible.push(cur)
        return acc
      },
      {
        sumVotePower: 0,
        elgible: [] as Validator[],
      }
    )
    .elgible.filter(
      ({ commission, status }) =>
        getIsBonded(status) &&
        Number(commission.commission_rates.rate) <= MAX_COMMISSION
    )
    .map(({ operator_address }) => operator_address)
}

export const getTotalStakedTokens = (validators: Validator[]) => {
  return BigNumber.sum(
    ...validators.map(({ tokens = 0 }) => Number(tokens))
  ).toNumber()
}

export const getQuickStakeMsgs = (
  address: string,
  coin: Coin,
  elgibleVals: ValAddress[],
  decimals: number
) => {
  const { denom, amount } = coin.toData()
  const totalAmt = new BigNumber(amount)
  const isLessThanAmt = (amt: number) =>
    totalAmt.isLessThan(toAmount(amt, { decimals }))

  const numOfValDests = isLessThanAmt(100)
    ? 1
    : isLessThanAmt(1000)
    ? 2
    : isLessThanAmt(10000)
    ? 3
    : 4

  const destVals = shuffle(elgibleVals).slice(0, numOfValDests)

  const msgs = destVals.map(
    (valDest) =>
      new MsgDelegate(
        address,
        valDest,
        new Coin(denom, totalAmt.dividedToIntegerBy(destVals.length).toString())
      )
  )
  return msgs
}

export const getQuickUnstakeMsgs = (
  address: string,
  coin: Coin,
  delegations: Delegation[]
) => {
  const { denom, amount } = coin.toData()
  const bnAmt = new BigNumber(amount)
  const msgs = []
  let remaining = bnAmt

  for (const delegation of delegations) {
    const { balance, validator_address } = delegation
    const delAmt = new BigNumber(balance.amount.toString())
    msgs.push(
      new MsgUndelegate(
        address,
        validator_address,
        new Coin(
          denom,
          remaining.lt(delAmt) ? remaining.toString() : delAmt.toString()
        )
      )
    )
    if (remaining.lt(delAmt)) {
      remaining = new BigNumber(0)
    } else {
      remaining = remaining.minus(delAmt)
    }
    if (remaining.isZero()) {
      break
    }
  }

  return msgs
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
