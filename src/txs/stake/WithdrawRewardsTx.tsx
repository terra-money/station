import { combineState } from "data/query"
import { useRewards } from "data/queries/distribution"

import WithdrawRewardsForm from "./WithdrawRewardsForm"
import { useAllianceHub } from "data/queries/alliance-protocol"

interface Props {
  chain: string
}

const WithdrawRewardsTx = ({ chain }: Props) => {
  const allianceHub = useAllianceHub()

  const { data: allianceHubRewards, ...allianceHubRewardsState } =
    allianceHub.usePendingRewards()
  const { data: rewards, ...rewardsState } = useRewards(chain)

  const state = combineState(rewardsState, allianceHubRewardsState)

  if (!rewards || !state.isSuccess) return null

  return (
    <WithdrawRewardsForm
      rewards={rewards}
      ahRewards={allianceHubRewards ?? []}
      chain={chain ?? ""}
    />
  )
}

export default WithdrawRewardsTx
