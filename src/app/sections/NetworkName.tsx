import classNames from "classnames"
import { useNetworkName } from "data/wallet"
import styles from "./NetworkName.module.scss"

const NetworkName = () => {
  const name = useNetworkName()
  if (name === "mainnet") return null
  return <div className={classNames(styles.text, styles.warning)}>{name}</div>
}

export default NetworkName
