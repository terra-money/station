import { Grid } from "components/layout"
import Links from "./Links"
import styles from "./Aside.module.scss"
import TFMPoweredBy from "txs/swap/TFMPoweredBy"

const Aside = () => {
  return (
    <Grid gap={20} className={styles.aside}>
      <Links />
      <TFMPoweredBy prices />
    </Grid>
  )
}

export default Aside
