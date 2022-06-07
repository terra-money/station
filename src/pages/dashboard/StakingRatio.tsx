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
  const render = () => {
    if (!(stakingPool && supply)) return null

    const bonded = stakingPool.bonded_tokens.amount.toString()
    const issuance = supply.find(({ denom }) => denom === "umis")?.amount

    if (!issuance) return null

    const ratio = Number(bonded) / Number(issuance)
    return (
      <>
        <p className={styles.pageName}>Dashboard</p>
        <div className={styles.flex}>
          <div className={styles.flexFull}>
            <div>
              {readAmount(bonded, { prefix: true, integer: true })}{" "}
              <span className={styles.unit}>MIS</span>
            </div>
            <p>MIS Issuance</p>
          </div>
          <div className={styles.flexFull}>
            <ReadPercent>{ratio}</ReadPercent>
            <p>Staking Ratio</p>
          </div>
          <div className={styles.flexFull}>
            <div>
              <ReadPercent>{data && last(data)?.value}</ReadPercent>
              <small>/year*</small>
            </div>
            <p>Staking Return</p>
          </div>
        </div>
      </>
    )
  }

  return <div className={classNames(styles.card)}>{render()}</div>
}

export default StakingRatio
