import { ExternalLink } from "components/general"
import styles from "./TFMPoweredBy.module.scss"

const TFMPoweredBy = () => {
  return (
    <p className={styles.component}>
      Powered by{" "}
      <ExternalLink href="https://tfm.com" className={styles.link}>
        TFM
      </ExternalLink>
    </p>
  )
}

export default TFMPoweredBy
