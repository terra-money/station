import { combineState } from "data/query"
import { useDelegations, useUnbondings } from "data/queries/staking"
import { useRewards } from "data/queries/distribution"
import { Fetching } from "components/feedback"
import DelegationsPromote from "app/containers/DelegationsPromote"
import Delegations from "./Delegations"
import Unbondings from "./Unbondings"
import Rewards from "./Rewards"
import { useChainID } from "data/wallet"
import styles from "./Staked.module.scss"

const Staked = () => {
  const chainID = useChainID()
  const { data: delegations, ...delegationsState } = useDelegations(chainID)
  const { data: unbondings, ...unbondingsState } = useUnbondings(chainID)
  const { data: rewards, ...rewardsState } = useRewards()
  const state = combineState(delegationsState, unbondingsState, rewardsState)

  const render = () => {
    if (!(delegations && unbondings && rewards)) return null

    const staked =
      delegations.length || unbondings.length || rewards.total.toArray().length

    if (!staked) return <DelegationsPromote horizontal />

    return (
      <section className={styles.staked__container}>
        <Delegations />
        <Unbondings />
        <Rewards />
      </section>
    )
  }

  return <Fetching {...state}>{render()}</Fetching>
}

export default Staked
