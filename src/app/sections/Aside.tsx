import { Grid } from "components/layout"
import Links from "./Links"
import styles from "./Aside.module.scss"
import CoinGeckoAndTFM from "components/pricesby/CoinGeckoAndTFM"

const Aside = () => {
  return (
    <Grid gap={20} className={styles.aside}>
      <Links />
      <CoinGeckoAndTFM />
    </Grid>
  )
}

export default Aside
