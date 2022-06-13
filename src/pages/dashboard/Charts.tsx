import classNames from "classnames/bind"
import { useIsClassic } from "data/query"
import { useIsTerraAPIAvailable } from "data/Terra/TerraAPI"
import TxVolume from "../charts/TxVolume"
import StakingReturn from "../charts/StakingReturn"
import TaxRewards from "../charts/TaxRewards"
import Wallets from "../charts/Wallets"
import styles from "./Charts.module.scss"

const cx = classNames.bind(styles)

const Charts = () => {
  const isClassic = useIsClassic()
  const available = useIsTerraAPIAvailable()
  if (!available) return null

  return (
    <div className={cx(styles.charts, { trisect: !isClassic })}>
      <TxVolume />
      <StakingReturn />
      {isClassic && <TaxRewards />}
      <Wallets />
    </div>
  )
}

export default Charts
