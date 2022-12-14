import { useNetworkName } from "data/wallet"
import styles from "./NetworkHeader.module.scss"

const NetworkHeader = () => {
  const network = useNetworkName()

  if (network === "mainnet") return null

  return <div className={styles.component}>{network.toUpperCase()}</div>
}

export default NetworkHeader
