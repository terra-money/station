import { combineState } from "data/query"
import { useDelegations, useUnbondings } from "data/queries/staking"
import { useRewards } from "data/queries/distribution"
import { Fetching } from "components/feedback"
import DelegationsPromote from "app/containers/DelegationsPromote"
import Delegations from "./delegations/Delegations"
import ChainDelegations from "./delegations/ChainDelegations"
import Unbondings from "./unbondings/Unbondings"
import Rewards from "./rewards/Rewards"
import { useChainID } from "data/wallet"
import styles from "./Staked.module.scss"
import ChainUnbondings from "./unbondings/ChainUnbondings"
import ChainRewards from "./rewards/ChainRewards"

const Staked = ({ chain }: { chain: string }) => {
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
        {chain !== "all" ? (
          <>
            <ChainDelegations chain={chain} />
            <ChainUnbondings chain={chain} />
            <ChainRewards chain={chain} />
          </>
        ) : (
          <>
            <Delegations />
            <Unbondings />
            <Rewards />
          </>
        )}
      </section>
    )
  }

  return <Fetching {...state}>{render()}</Fetching>
}

export default Staked
