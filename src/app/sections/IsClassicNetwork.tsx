import { useIsClassic } from "data/query"
import styles from "./IsClassicNetwork.module.scss"

const IsClassicNetwork = () => {
  const isClassic = useIsClassic()

  return (
    <div className={styles.component}>
      {isClassic ? "Terra Classic" : "Terra 2.0"}
    </div>
  )
}

export default IsClassicNetwork
