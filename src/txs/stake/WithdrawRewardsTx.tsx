import { combineState } from "data/query"
import { useRewards } from "data/queries/distribution"
import { useValidators } from "data/queries/staking"

import WithdrawRewardsForm from "./WithdrawRewardsForm"

interface Props {
  chain: string
}

const WithdrawRewardsTx = ({ chain }: Props) => {
  const { data: rewards, ...rewardsState } = useRewards(chain)
  const { data: validators, ...validatorsState } = useValidators(chain)

  const state = combineState(rewardsState, validatorsState)

  if (!rewards || !validators || !state.isSuccess) return null

  return (
    <WithdrawRewardsForm
      rewards={rewards}
      validators={validators}
      chain={chain ?? ""}
    />
  )
}

export default WithdrawRewardsTx
