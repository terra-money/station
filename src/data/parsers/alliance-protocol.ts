import {
  AllianceDelegation,
  AllianceDelegationRes,
} from "data/queries/alliance"
import { AllianceDelegationResponse as AllianceModuleDelegationResponse } from "@terra-money/feather.js/dist/client/lcd/api/AllianceAPI"
import { Delegation } from "@terra-money/feather.js"

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
  delegations?: AllianceDelegationRes[]
): Delegation[] => {
  if (delegations === undefined) {
    return []
  }

  const _delegations = delegations.flatMap((del) => del.delegations)

  return _delegations.map((del) => {
    return Delegation.fromData({
      delegation: {
        delegator_address: del.delegation.delegator_address,
        validator_address: del.delegation.validator_address,
        shares: del.delegation.shares,
      },
      balance: {
        amount: del.balance.amount.toString(),
        denom: del.balance.denom,
      },
    })
  })
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
