import { useNetworkName } from "data/wallet"
import styles from "./NetworkHeader.module.scss"

const NetworkHeader = () => {
  const network = useNetworkName()

  return <div className={styles.component}>{network}</div>
}

export default NetworkHeader
