import { ExternalLink } from "components/general"
import styles from "./TFMLink.module.scss"

const TFMLink = () => {
  return (
    <span className={styles.container}>
      <span>Prices by </span>
      <ExternalLink href="https://tfm.com" className={styles.link}>
        TFM
      </ExternalLink>
    </span>
  )
}

export default TFMLink
