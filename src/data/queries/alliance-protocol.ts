import { RefetchOptions, queryKey } from "data/query"
import { useInterchainLCDClient } from "./lcdClient"
import { useQuery } from "react-query"
import { useChainID } from "data/wallet"
import {
  AHAllPendingRewardsQueryRes,
  AHConfig,
  AHStakedBalancesRes,
  AHWhitelistedAssets,
} from "data/types/alliance-protocol-conf"
import { AllianceDetails, EmptyAllianceDetails } from "./alliance"

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

  const useStakedBalances = (address?: string) => {
    const lcd = useInterchainLCDClient()
    const hubAddress = useHubAddress()

    return useQuery(
      [queryKey.allianceProtocol.hubStakedBalances],
      async (): Promise<AHStakedBalancesRes> => {
        const data: AHStakedBalancesRes = await lcd.wasm.contractQuery(
          hubAddress,
          {
            all_staked_balances: {
              address,
            },
          }
        )
        return data
      },
      { ...RefetchOptions.INFINITY }
    )
  }

  const usePendingRewards = (address?: string) => {
    const lcd = useInterchainLCDClient()
    const hubAddress = useHubAddress()

    return useQuery(
      [queryKey.allianceProtocol.hubPendingRewards],
      async (): Promise<AHAllPendingRewardsQueryRes> => {
        const data: AHAllPendingRewardsQueryRes = await lcd.wasm.contractQuery(
          hubAddress,
          {
            all_pending_rewards: {
              address,
            },
          }
        )
        return data
      },
      { ...RefetchOptions.INFINITY }
    )
  }

  return {
    useConfig,
    useWhitelistedAssets,
    useStakedBalances,
    usePendingRewards,
    useHubAddress,
  }
}
