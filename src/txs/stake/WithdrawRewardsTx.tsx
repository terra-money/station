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

  const rewards: Rewards = {
    rewards: {
      ...stakingRewards?.rewards,
    },
    total: stakingRewards?.total ?? Coins.fromAmino(null),
  }

  // If the current chain is terra mainnet or testnet and alliance
  // hub has rewards, append these rewards to the total rewards
  if (
    (chain === "pisco-1" || chain === "phoenix-1") &&
    allianceHubRewards?.total
  ) {
    rewards.total = rewards.total.add(allianceHubRewards.total)

    rewards.rewards = {
      ...rewards.rewards,
      ...allianceHubRewards.rewards,
    }
  }
  const state = combineState(stakingRewardsState, allianceHubRewardsState)

  if (!rewards || !state.isSuccess) return null

  return <WithdrawRewardsForm rewards={rewards} chain={chain ?? ""} />
}

export default WithdrawRewardsTx
