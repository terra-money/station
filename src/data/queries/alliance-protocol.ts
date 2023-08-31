import { RefetchOptions, queryKey } from "data/query"
import { useInterchainLCDClient } from "./lcdClient"
import { useQuery } from "react-query"
import { useChainID } from "data/wallet"
import {
  AHAllRewards,
  AHConfig,
  AHStakedBalancesRes,
  AHWhitelistedAssets,
} from "data/types/alliance-protocol"
import {
  AllianceDelegationRes,
  AllianceDetails,
  EmptyAllianceDelegation,
  EmptyAllianceDetails,
} from "./alliance"
import useAddress from "auth/hooks/useAddress"
import { Coin } from "@terra-money/feather.js"

export const useAllianceHub = () => {
  const useHubAddress = () => {
    const chainID = useChainID()

    if (chainID === "phoenix-1") {
      return "terra1jwyzzsaag4t0evnuukc35ysyrx9arzdde2kg9cld28alhjurtthq0prs2s"
    } else if (chainID === "pisco-1") {
      return "terra1eaxcahzxp0x8wqejqjlqaey53tp06l728qad6z395lyzgl026qkq20xj43"
    } else {
      return ""
    }
  }

  const useConfig = () => {
    const lcd = useInterchainLCDClient()
    const hubAddress = useHubAddress()

    return useQuery(
      [queryKey.allianceProtocol.hubConfig],
      async (): Promise<AHConfig> => {
        const data: AHConfig = await lcd.wasm.contractQuery(hubAddress, {
          config: {},
        })
        return data
      },
      { ...RefetchOptions.INFINITY }
    )
  }

  const useWhitelistedAssets = () => {
    const lcd = useInterchainLCDClient()
    const hubAddress = useHubAddress()
    const chainID = useChainID()

    return useQuery(
      [queryKey.allianceProtocol.hubWhitelistedAssets],
      async (): Promise<Array<AllianceDetails>> => {
        if (chainID !== "phoenix-1" && chainID !== "pisco-1") return []

        const data: AHWhitelistedAssets = await lcd.wasm.contractQuery(
          hubAddress,
          { whitelisted_assets: {} }
        )

        const alliancesDetails = new Array<AllianceDetails>()
        for (const [key, asset] of Object.entries(data)) {
          for (const alliance of asset) {
            alliancesDetails.push({
              ...EmptyAllianceDetails(),
              chainID: chainID,
              denom: alliance.native,
              stakeOnAllianceHub: true,
              originChainID: key,
            })
          }
        }

        return alliancesDetails
      },
      { ...RefetchOptions.INFINITY }
    )
  }

  const useDelegations = () => {
    const chainID = useChainID()
    const address = useAddress()
    const lcd = useInterchainLCDClient()
    const hubAddress = useHubAddress()

    return useQuery(
      [queryKey.allianceProtocol.hubStakedBalances],
      async (): Promise<AllianceDelegationRes[]> => {
        const alliancesDelegations = new Array<AllianceDelegationRes>()
        try {
          if (chainID !== "phoenix-1" && chainID !== "pisco-1") return []

          const data: AHStakedBalancesRes = await lcd.wasm.contractQuery(
            hubAddress,
            {
              all_staked_balances: {
                address,
              },
            }
          )

          for (const del of data) {
            if (del.balance !== "0") {
              const parsedDelegation = {
                chainID: chainID,
                delegations: [
                  {
                    balance: new Coin(del.asset.native, del.balance),
                    delegation: {
                      ...EmptyAllianceDelegation(),
                      delegator_address: address as string,
                      validator_address: hubAddress,
                      denom: del.asset.native,
                    },
                  },
                ],
              }

              alliancesDelegations.push(parsedDelegation)
            }
          }
          return alliancesDelegations
        } catch (e) {
          return alliancesDelegations
        }
      },
      { ...RefetchOptions.INFINITY }
    )
  }

  const usePendingRewards = () => {
    const chainID = useChainID()
    const address = useAddress()
    const lcd = useInterchainLCDClient()
    const hubAddress = useHubAddress()

    return useQuery(
      [queryKey.allianceProtocol.hubPendingRewards],
      async (): Promise<AHAllRewards> => {
        if (chainID !== "phoenix-1" && chainID !== "pisco-1") return []

        try {
          const data: AHAllRewards = await lcd.wasm.contractQuery(hubAddress, {
            all_pending_rewards: {
              address,
            },
          })

          return data
        } catch (e) {
          return []
        }
      },
      { ...RefetchOptions.INFINITY }
    )
  }

  return {
    useConfig,
    useWhitelistedAssets,
    useDelegations,
    usePendingRewards,
    useHubAddress,
  }
}
