import { useQuery, useQueries } from "react-query"
import { flatten, path, uniqBy } from "ramda"
import BigNumber from "bignumber.js"
import {
  AccAddress,
  Coin,
  MsgAllianceDelegate,
  MsgAllianceUndelegate,
  MsgDelegate,
  MsgUndelegate,
  StakingParams,
  ValAddress,
  Validator,
} from "@terra-money/feather.js"
import { Delegation, UnbondingDelegation } from "@terra-money/feather.js"
import { has } from "utils/num"
import { StakeAction } from "txs/stake/StakeForm"
import { queryKey, Pagination, RefetchOptions, combineState } from "../query"
import { useInterchainLCDClient } from "./lcdClient"
import { useInterchainAddressesWithFeature } from "auth/hooks/useAddress"
import { toAmount } from "@terra-money/terra-utils"
import { useExchangeRates } from "data/queries/coingecko"
import { useNativeDenoms } from "data/token"
import shuffle from "utils/shuffle"
import { getIsBonded } from "pages/stake/ValidatorsList"
import { useNetworkWithFeature } from "data/wallet"
import { ChainFeature } from "types/chains"

import { AllianceDelegationResponse } from "@terra-money/feather.js/dist/client/lcd/api/AllianceAPI"
import {
  AllianceDelegation,
  useInterchainAllianceDelegations,
} from "./alliance"

export const useInterchainValidators = () => {
  const addresses = useInterchainAddressesWithFeature(ChainFeature.STAKING)
  const lcd = useInterchainLCDClient()

  return useQueries(
    Object.keys(addresses ?? {}).map((chainID) => {
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
  const addresses = useInterchainAddressesWithFeature(ChainFeature.STAKING)
  const lcd = useInterchainLCDClient()

  return useQueries(
    Object.keys(addresses ?? {}).map((chainID) => {
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

export const useAllStakingParams = () => {
  const lcd = useInterchainLCDClient()
  const network = useNetworkWithFeature(ChainFeature.STAKING)

  return useQueries(
    Object.values(network ?? {}).map(({ chainID }) => {
      return {
        queryKey: [queryKey.staking.params, chainID],
        queryFn: async () => {
          const params = await lcd.staking.parameters(chainID)
          return { ...params, chainID }
        },
        ...RefetchOptions.DEFAULT,
      }
    })
  )
}

export const getChainUnbondTime = (stakingParams: StakingParams) =>
  stakingParams?.unbonding_time / (60 * 60 * 24)

export const useDelegations = (chainID: string, disabled?: boolean) => {
  const addresses = useInterchainAddressesWithFeature(ChainFeature.STAKING)
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
    { ...RefetchOptions.DEFAULT, enabled: !disabled }
  )
}

export const useDelegation = (validatorAddress: ValAddress) => {
  const addresses = useInterchainAddressesWithFeature(ChainFeature.STAKING)
  const lcd = useInterchainLCDClient()

  return useQuery(
    [queryKey.staking.delegation, addresses, validatorAddress],
    async () => {
      if (!addresses) return
      const prefix = ValAddress.getPrefix(validatorAddress)
      const address = Object.values(addresses ?? {}).find(
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
  const addresses = useInterchainAddressesWithFeature(ChainFeature.STAKING)
  const lcd = useInterchainLCDClient()

  return useQueries(
    Object.keys(addresses ?? {}).map((chainID) => {
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
  const addresses = useInterchainAddressesWithFeature(ChainFeature.STAKING)
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
export const calcDelegationsTotal = (
  delegations: Delegation[] | AllianceDelegationResponse[]
) => {
  return delegations.length
    ? BigNumber.sum(
        ...delegations.map(({ balance }) => balance.amount.toString())
      ).toString()
    : "0"
}

export const useStakeChartData = (chain?: string) => {
  const { data: prices } = useExchangeRates()
  const readNativeDenom = useNativeDenoms()

  const delegationsData = useInterchainDelegations()
  const delegations: Delegation[] = delegationsData
    .filter(({ data }) => !chain || chain === data?.chainID)
    .reduce(
      (acc, { data }) => (data ? [...data?.delegation, ...acc] : acc),
      [] as Delegation[]
    )
  const allianceDelegationsData = useInterchainAllianceDelegations()
  const allianceDelegations = allianceDelegationsData
    .filter(({ data }) => !chain || chain === data?.chainID)
    .reduce(
      (acc, { data }) =>
        data?.delegations ? [...data.delegations, ...acc] : acc,
      [] as AllianceDelegation[]
    )

  const delAmounts: Record<string, number> = delegations.reduce(
    (acc, { balance }) => {
      const amount = balance.amount.toNumber()
      const { token } = readNativeDenom(balance.denom)

      return {
        ...acc,
        [token]: (acc[token] ?? 0) + amount,
      }
    },
    {} as Record<string, number>
  )

  const totalAmounts = allianceDelegations.reduce((acc, { balance }) => {
    const amount = balance.amount.toNumber()
    const { token } = readNativeDenom(balance.denom)

    return {
      ...acc,
      [token]: (acc[token] ?? 0) + amount,
    }
  }, delAmounts)

  return {
    ...combineState(...delegationsData, ...allianceDelegationsData),

    data: Object.entries(totalAmounts ?? {}).map(([token, amount]) => {
      const { decimals, symbol, icon } = readNativeDenom(token)

      return {
        name: symbol,
        value: (amount * (prices?.[token]?.price ?? 0)) / 10 ** decimals,
        amount,
        denom: token,
        icon,
      }
    }),
  }
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
  decimals: number,
  isAlliance: boolean
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

  const msgs = destVals.map((valDest) =>
    isAlliance
      ? new MsgAllianceDelegate(
          address,
          valDest,
          new Coin(
            denom,
            totalAmt.dividedToIntegerBy(destVals.length).toString()
          )
        )
      : new MsgDelegate(
          address,
          valDest,
          new Coin(
            denom,
            totalAmt.dividedToIntegerBy(destVals.length).toString()
          )
        )
  )
  return msgs
}

export const getQuickUnstakeMsgs = (
  address: string,
  coin: Coin,
  details:
    | {
        isAlliance: false
        delegations: Delegation[]
      }
    | {
        isAlliance: true
        delegations: AllianceDelegationResponse[]
      }
) => {
  const { isAlliance, delegations } = details
  const { denom, amount } = coin.toData()
  const bnAmt = new BigNumber(amount)
  const msgs = []
  let remaining = bnAmt

  if (isAlliance) {
    for (const d of delegations) {
      const { balance, delegation } = d
      const delAmt = new BigNumber(balance.amount)

      msgs.push(
        new MsgAllianceUndelegate(
          address,
          delegation.validator_address,
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
  } else {
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
