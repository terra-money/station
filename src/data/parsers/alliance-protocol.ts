import {
  AllianceDelegation,
  AllianceDelegationRes,
} from "data/queries/alliance"
import { AllianceDelegationResponse as AllianceModuleDelegationResponse } from "@terra-money/feather.js/dist/client/lcd/api/AllianceAPI"
import { Coin, Coins, Dec, Delegation } from "@terra-money/feather.js"
import { AHAllRewards } from "data/types/alliance-protocol"
import { DefaultRewardsListing, RewardsListing } from "data/types/rewards-form"

export const parseDelegationsToResponse = (
  delegations?: AllianceDelegationRes[]
): AllianceModuleDelegationResponse[] => {
  if (delegations === undefined) {
    return []
  }

  return delegations.flatMap((del) => {
    return del.delegations.map((del) => {
      return {
        ...del,
        balance: {
          amount: del.balance.amount.toString(),
          denom: del.balance.denom,
        },
      }
    })
  })
}

export const parseResToDelegation = (
  data?: AllianceDelegationRes[],
  chain?: string
): Delegation[] => {
  const parsedDelegations = new Array<Delegation>()
  if (data === undefined) return parsedDelegations

  for (const item of data) {
    if (chain === undefined || chain === "" || item.chainID === chain) {
      for (const del of item.delegations) {
        const parsedDel = new Delegation(
          del.delegation.delegator_address,
          del.delegation.validator_address,
          new Dec(del.delegation.shares),
          new Coin(del.balance.denom, del.balance.amount)
        )
        parsedDelegations.push(parsedDel)
      }
    }
  }

  return parsedDelegations
}

export const getAllianceDelegations = (
  data?: AllianceDelegationRes[]
): AllianceDelegation[] => {
  const allianceDelegationsList = new Array<AllianceDelegation>()

  if (data === undefined) {
    return allianceDelegationsList
  }

  for (const value of data) {
    for (const item of value.delegations) {
      allianceDelegationsList.push({
        delegation: item.delegation,
        balance: item.balance,
      })
    }
  }

  return allianceDelegationsList
}

export const parseRewards = (
  data?: AHAllRewards,
  allianceHubAddress?: string
): RewardsListing => {
  const allyRewards = DefaultRewardsListing()
  if (data === undefined || allianceHubAddress === undefined) {
    return allyRewards
  }

  const sortedData = data.sort((a, b) => Number(b.rewards) - Number(a.rewards))

  for (const item of sortedData) {
    if (item.rewards === "0") continue

    allyRewards.byValidator.push({
      stakedAsset: item.staked_asset.native,
      address: allianceHubAddress,
      sum: item.rewards,
      list: [
        {
          amount: item.rewards,
          denom: item.reward_asset.native,
        },
      ],
    })

    allyRewards.total.list.push({
      amount: item.rewards,
      denom: item.reward_asset.native,
    })
  }

  return allyRewards
}

export const getCoinsFromRewards = (data?: AHAllRewards): Coins => {
  let coins = new Coins()
  if (data === undefined) {
    return coins
  }

  for (const item of data) {
    if (item.rewards === "0") continue

    const _coins = new Coin(item.reward_asset.native, item.rewards)
    coins = coins.add(_coins)
  }

  return coins
}
