import { combineState } from "data/query"
import { useRewards } from "data/queries/distribution"

import WithdrawRewardsForm from "./WithdrawRewardsForm"
import { useAllianceHub } from "data/queries/alliance-protocol"
import { Coins, Rewards } from "@terra-money/feather.js"

interface Props {
  chain: string
}

const WithdrawRewardsTx = ({ chain }: Props) => {
  const allianceHub = useAllianceHub()

  const { data: allianceHubRewards, ...allianceHubRewardsState } =
    allianceHub.usePendingRewards()
  const { data: stakingRewards, ...stakingRewardsState } = useRewards(chain)

  // If there are stakingRewards add to allianceHubRewards
  // otherwise default to empty Coins
  const totalRewards = stakingRewards?.total
    ? stakingRewards.total.add(
        allianceHubRewards?.total ?? Coins.fromAmino(null)
      )
    : allianceHubRewards?.total
    ? allianceHubRewards?.total
    : Coins.fromAmino(null)
  const rewards: Rewards = {
    rewards: {
      ...stakingRewards?.rewards,
      ...allianceHubRewards?.rewards,
    },
    total: totalRewards,
  }

  const state = combineState(stakingRewardsState, allianceHubRewardsState)

  if (!rewards || !state.isSuccess) return null

  return <WithdrawRewardsForm rewards={rewards} chain={chain ?? ""} />
}

export default WithdrawRewardsTx
