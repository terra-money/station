import { RefetchOptions, queryKey } from "data/query"
import { useInterchainLCDClient } from "./lcdClient"
import { useQuery } from "react-query"
import { useChainID } from "data/wallet"
import {
  AHAllPendingRewardsQueryRes,
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
import { Coin, Rewards, Coins } from "@terra-money/feather.js"

export const useAllianceHub = () => {
  const useHubAddress = () => {
    const chainID = useChainID()

    if (chainID === "phoenix-1") {
      throw Error("Not yet deployed on Phoenix-1 ")
    } else if (chainID === "pisco-1") {
      return "terra1majrm6e6n0eg760n9fs4g5jvwzh4ytp8e2d99mfgzv2e7mjmdwxse0ty73"
    }

    throw Error("Feature available only on Terra")
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
    const alliancesDelegations = new Array<AllianceDelegationRes>()

    return useQuery(
      [queryKey.allianceProtocol.hubStakedBalances],
      async (): Promise<AllianceDelegationRes[]> => {
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
              alliancesDelegations.push({
                chainID: chainID,
                delegations: data.map((del) => {
                  return {
                    balance: new Coin(del.asset.native, del.balance),
                    delegation: {
                      ...EmptyAllianceDelegation(),
                      delegator_address: address as string,
                      validator_address: hubAddress,
                      denom: del.asset.native,
                    },
                  }
                }),
              })
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
      async (): Promise<Rewards> => {
        const rewards: Rewards = { rewards: {}, total: new Coins() }
        if (chainID !== "phoenix-1" && chainID !== "pisco-1") return rewards

        try {
          const data: AHAllPendingRewardsQueryRes =
            await lcd.wasm.contractQuery(hubAddress, {
              all_pending_rewards: {
                address,
              },
            })
          data[0].rewards = "696969696969699669699"

          for (const pendingReward of data) {
            if (pendingReward.rewards === "0") continue

            const tokens = new Coin(
              pendingReward.reward_asset.native,
              pendingReward.rewards
            )

            // Just in case the hub address already exists we
            // addup the token rewards
            if (rewards.rewards[hubAddress] !== undefined) {
              rewards.rewards[hubAddress] =
                rewards.rewards[hubAddress].add(tokens)
            } else {
              rewards.rewards[hubAddress] = Coins.fromString(
                pendingReward.rewards + pendingReward.reward_asset.native
              )
            }

            rewards.total = rewards.total.add(tokens)
          }

          return rewards
        } catch (e) {
          return rewards
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
