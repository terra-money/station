import { Fetching } from "components/feedback"
import Delegations from "./delegations/Delegations"
import ChainDelegations from "./delegations/ChainDelegations"
import Unbondings from "./unbondings/Unbondings"
import Rewards from "./rewards/Rewards"
import styles from "./Staked.module.scss"
import ChainUnbondings from "./unbondings/ChainUnbondings"
import ChainRewards from "./rewards/ChainRewards"

const Staked = ({ chain }: { chain: string }) => {
  const render = () => {
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

  return <Fetching>{render()}</Fetching>
}

export default Staked
