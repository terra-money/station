import classNames from "classnames/bind"
import { useIsTerraAPIAvailable } from "data/Terra/TerraAPI"
import TxVolume from "../charts/TxVolume"
import StakingReturn from "../charts/StakingReturn"
import Wallets from "../charts/Wallets"
import styles from "./Charts.module.scss"

const cx = classNames.bind(styles)

const Charts = () => {
  const available = useIsTerraAPIAvailable()
  if (!available) return null

  return (
    <div className={cx(styles.charts, { trisect: true })}>
      <TxVolume />
      <StakingReturn />
      <Wallets />
    </div>
  )
}

export default Charts
