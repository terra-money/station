import { ExternalLink } from "components/general"
import styles from "./CoinGeckoLink.module.scss"
import { ReactComponent as CoinGecko } from "./CoinGecko.svg"

const CoinGeckoLink = () => {
  return (
    <span className={styles.container}>
      <span>Prices by </span>
      <ExternalLink href="https://www.coingecko.com/" className={styles.link}>
        <CoinGecko width={18} /> Coingecko
      </ExternalLink>
    </span>
  )
}

export default CoinGeckoLink
