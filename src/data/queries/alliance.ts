import { useQueries, useQuery } from "react-query"
import { queryKey, Pagination, RefetchOptions } from "../query"
import { useInterchainLCDClient } from "./lcdClient"
import {
  AllianceAsset,
  AllianceDelegationResponse,
} from "@terra-money/feather.js/dist/client/lcd/api/AllianceAPI"
import { useNetwork } from "data/wallet"
import { useInterchainAddresses } from "auth/hooks/useAddress"
import { Coin } from "@terra-money/feather.js"

export interface AllianceDetails extends AllianceAsset {
  chainID: string
}

export const useAlliances = (chainID: string) => {
  const lcd = useInterchainLCDClient()

  return useQuery(
    [queryKey.alliance.alliances, chainID],
    async (): Promise<AllianceDetails[]> => {
      const { alliances } = await lcd.alliance.alliances(chainID)
      return (alliances as AllianceAsset[]).map((a) => ({ ...a, chainID }))
    },
    { ...RefetchOptions.DEFAULT }
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
            const { alliances } = await lcd.alliance.alliances(chainID)

            return (alliances as AllianceAsset[]).map((a) => ({
              ...a,
              chainID,
            }))
          },
          ...RefetchOptions.DEFAULT,
        }
      })
  )
}

export interface AllianceDelegation
  extends Omit<AllianceDelegationResponse, "balance"> {
  balance: Coin
}

export const useAllianceDelegations = () => {
  const addresses = useInterchainAddresses() || {}
  const lcd = useInterchainLCDClient()
  const network = useNetwork()

  return useQueries(
    Object.keys(addresses)
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
