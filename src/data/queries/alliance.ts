import { useQueries, useQuery } from "react-query"
import { queryKey, Pagination, RefetchOptions } from "../query"
import { useInterchainLCDClient } from "./lcdClient"
import {
  AllianceAsset,
  AllianceDelegationResponse,
  AllianceDelegation as AllianceModuleDelegation,
} from "@terra-money/feather.js/dist/client/lcd/api/AllianceAPI"
import { useNetwork } from "data/wallet"
import { useInterchainAddressesWithFeature } from "auth/hooks/useAddress"
import { Coin, ValAddress } from "@terra-money/feather.js"
import { StakeAction } from "txs/stake/StakeForm"
import { ChainFeature } from "types/chains"

export interface AllianceDetails extends AllianceAsset {
  chainID: string
  originChainID?: string
  stakeOnAllianceHub?: boolean
}

export function EmptyAllianceDetails(): AllianceDetails {
  return {
    chainID: "",
    denom: "",
    reward_weight: "0",
    take_rate: "0",
    total_tokens: "0",
    total_validator_shares: "0",
    reward_start_time: "0",
    reward_change_rate: "0",
    reward_change_interval: "0",
    last_reward_change_time: "0",
  }
}

export const useAlliances = (chainID: string) => {
  const lcd = useInterchainLCDClient()

  return useQuery(
    [queryKey.alliance.alliances, chainID],
    async (): Promise<AllianceDetails[]> => {
      const { alliances } = await lcd.alliance.alliances(chainID)
      return (alliances as AllianceAsset[]).map((a) => ({ ...a, chainID }))
    },
    { ...RefetchOptions.INFINITY }
  )
}

export const useAlliance = (
  chainID: string,
  denom: string,
  disabled?: boolean
) => {
  const lcd = useInterchainLCDClient()

  return useQuery(
    [queryKey.alliance.alliances, chainID, denom],
    async (): Promise<AllianceAsset> => {
      const { alliance } = await lcd.alliance.alliance(chainID, denom)
      return alliance
    },
    { ...RefetchOptions.INFINITY, enabled: !disabled }
  )
}

export const useAllAlliances = () => {
  const lcd = useInterchainLCDClient()
  const network = useNetwork()

  return useQueries(
    Object.values(network ?? {})
      .filter(({ alliance }) => alliance)
      .map(({ chainID }) => {
        return {
          queryKey: [queryKey.alliance.alliances, chainID],
          queryFn: async (): Promise<AllianceDetails[]> => {
            let { alliances } = await lcd.alliance.alliances(chainID)

            // Filter out the alliance created by the Alliance Protocol Hub because it's economics are calculated differently
            // and should not be visibile in the frontend UI bcause the stake is held by the Hub contract
            // https://github.com/terra-money/alliance-protocol/blob/main/contracts/alliance-hub/src/contract.rs#L49-L51
            if (alliances?.length) {
              alliances = alliances.filter(
                (a) => !a.denom.endsWith("/ualliance")
              )
            }

            return (alliances as AllianceAsset[]).map((a) => ({
              ...a,
              chainID,
            }))
          },
          ...RefetchOptions.INFINITY,
        }
      })
  )
}

export interface AllianceDelegation
  extends Omit<AllianceDelegationResponse, "balance"> {
  balance: Coin
}

export function EmptyAllianceDelegation(): AllianceModuleDelegation {
  return {
    delegator_address: "",
    validator_address: "",
    denom: "",
    shares: "0",
    reward_history: [],
    last_reward_claim_height: "0",
  }
}

export interface AllianceDelegationRes {
  delegations: AllianceDelegation[]
  chainID: string
}

export const useAllianceDelegations = (chainID: string, disabled?: boolean) => {
  const addresses = useInterchainAddressesWithFeature(ChainFeature.STAKING)
  const lcd = useInterchainLCDClient()

  return useQuery(
    [queryKey.alliance.delegation, addresses, chainID],
    async () => {
      if (!addresses || !addresses[chainID]) return []

      const { delegations } = await lcd.alliance.alliancesDelegation(
        addresses[chainID],
        Pagination
      )

      return delegations
    },
    { ...RefetchOptions.DEFAULT, enabled: !disabled }
  )
}

export const useInterchainAllianceDelegations = () => {
  const addresses = useInterchainAddressesWithFeature(ChainFeature.STAKING)
  const lcd = useInterchainLCDClient()
  const network = useNetwork()

  return useQueries(
    Object.keys(addresses ?? {})
      .filter((chainID) => network[chainID]?.alliance)
      .map((chainID) => {
        return {
          queryKey: [queryKey.alliance.delegations, addresses, chainID],
          queryFn: async () => {
            const { delegations } = await lcd.alliance.alliancesDelegation(
              addresses[chainID],
              Pagination
            )

            return {
              delegations: delegations?.map((del) => ({
                ...del,
                balance: Coin.fromData(
                  del.balance as unknown as { amount: string; denom: string }
                ),
              })) as AllianceDelegation[],
              chainID,
            }
          },
          ...RefetchOptions.DEFAULT,
          disabled: !addresses?.[chainID],
        }
      })
  )
}

export const getAvailableAllianceStakeActions = (
  destination: ValAddress,
  delegations: AllianceDelegationResponse[]
) => {
  return {
    [StakeAction.DELEGATE]: true,
    [StakeAction.REDELEGATE]:
      delegations.filter(
        ({ delegation: { validator_address } }) =>
          validator_address !== destination
      ).length > 0,
    [StakeAction.UNBOND]: !!delegations.filter(
      ({ delegation: { validator_address } }) =>
        validator_address === destination
    ).length,
  }
}
