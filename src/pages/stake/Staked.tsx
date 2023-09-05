import { Fetching } from "components/feedback"
import Delegations from "./delegations/Delegations"
import ChainDelegations from "./delegations/ChainDelegations"
import Unbondings from "./unbondings/Unbondings"
import styles from "./Staked.module.scss"
import ChainUnbondings from "./unbondings/ChainUnbondings"
import ChainRewards from "./rewards/ChainRewards"

const Staked = ({ chain }: { chain: string }) => {
  // TODO: refact this component to:
  //      - query the data at this level (or at parent level) instead of at KPI level,
  //      - if querying the data at this level parse and filter the data (if needed)
  //      - send the data down to each KPI as a property,
  //      - remove the {CHAIN !== "all"} (L19) because each KPI must know how to handle the data.

  const render = () => {
    return (
      <section className={styles.staked__container}>
        {chain !== "all" ? (
          <>
            <ChainDelegations chain={chain} />
            <ChainUnbondings chain={chain} />
          </>
        ) : (
          <>
            <Delegations />
            <Unbondings />
          </>
        )}
        <ChainRewards chain={chain} />
      </section>
    )
  }

  return <Fetching>{render()}</Fetching>
}

export default Staked
