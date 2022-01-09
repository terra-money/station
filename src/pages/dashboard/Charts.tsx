import { useIsTerraAPIAvailable } from "data/Terra/TerraAPI"
import TxVolume from "../charts/TxVolume"
import StakingReturn from "../charts/StakingReturn"
import TaxRewards from "../charts/TaxRewards"
import Wallets from "../charts/Wallets"
import styles from "./Charts.module.scss"

const Charts = () => {
  const available = useIsTerraAPIAvailable()
  if (!available) return null

  return (
    <div className={styles.charts}>
      <TxVolume />
      <StakingReturn />
      <TaxRewards />
      <Wallets />
    </div>
  )
}

export default Charts
