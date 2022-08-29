import { readAmount } from "@terra.kitchen/utils"
import { useSupply } from "data/queries/bank"
import { useStakingPool } from "data/queries/staking"
import { ReadPercent } from "components/token"
import classNames from "classnames/bind"
import styles from "./Dashboard.module.scss"
import { AggregateStakingReturn, useStakingReturn } from "data/Terra/TerraAPI"
import { last } from "ramda"
const StakingRatio = () => {
  const { data: stakingPool } = useStakingPool()
  const { data: supply } = useSupply()
  const { data } = useStakingReturn(AggregateStakingReturn.ANNUALIZED)
  // console.log(data)
  const StakingRatioView = () => {
    // if (!(stakingPool && supply)) return null

    const bonded = stakingPool ? stakingPool.bonded_tokens.amount.toString() : 0
    const issuance = supply
      ? supply.find(({ denom }) => denom === "umis")?.amount
      : 0
    // if (!issuance) return null

    const ratio = Number(bonded) / Number(issuance)
    return (
      <div className={styles.cardBox}>
        <p className={styles.pageName}>Dashboard</p>
        <div className={styles.flex}>
          <div className={styles.flexFull}>
            <div>
              {readAmount(issuance, { prefix: true, integer: true })}{" "}
              <span className={styles.unit}>MIS</span>
            </div>
            <p>Total Supply</p>
          </div>
          <div className={styles.flexFull}>
            <ReadPercent>{ratio}</ReadPercent>
            <p>Staking Ratio</p>
          </div>
          <div className={styles.flexFull}>
            <div>
              <ReadPercent>{data && last(data)?.value}</ReadPercent>
            </div>
            <p>APR</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={classNames(styles.card)}>
      <StakingRatioView />
    </div>
  )
}

export default StakingRatio
