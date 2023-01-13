import { Grid } from "components/layout"
import Links from "./Links"
import styles from "./Aside.module.scss"
import CoinGeckoLink from "components/coingecko/CoinGeckoLink"

const Aside = () => {
  return (
    <Grid gap={20} className={styles.aside}>
      <Links />
      <CoinGeckoLink />
    </Grid>
  )
}

export default Aside
