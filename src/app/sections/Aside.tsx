import { Grid } from "components/layout"
import Links from "./Links"
import styles from "./Aside.module.scss"
import TFMLink from "components/tfm/TFMLink"

const Aside = () => {
  return (
    <Grid gap={20} className={styles.aside}>
      <Links />
      <TFMLink />
    </Grid>
  )
}

export default Aside
