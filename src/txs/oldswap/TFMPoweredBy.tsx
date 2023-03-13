import { ExternalLink } from "components/general"
import styles from "./TFMPoweredBy.module.scss"

const TFMPoweredBy = (props: { prices?: boolean }) => {
  return (
    <p className={styles.component}>
      {props.prices ? "Prices" : "Powered"} by{" "}
      <ExternalLink href="https://tfm.com" className={styles.link}>
        TFM
      </ExternalLink>
    </p>
  )
}

export default TFMPoweredBy
