import { ExternalLink } from "components/general"
import styles from "./CoinGeckoAndTFM.module.scss"
import { ReactComponent as CoinGecko } from "../coingecko/CoinGecko.svg"

const CoinGeckoAndTFM = () => {
  return (
    <span className={styles.container}>
      <span>Prices by </span>
      <div className={styles.brands}>
        <ExternalLink href="https://tfm.com" className={styles.link}>
          TFM
        </ExternalLink>
        <span>and </span>
        <ExternalLink href="https://www.coingecko.com/" className={styles.link}>
          <CoinGecko width={18} /> Coingecko
        </ExternalLink>
      </div>
    </span>
  )
}

export default CoinGeckoAndTFM
