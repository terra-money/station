import { Grid } from "components/layout"
import LastHeight from "./LastHeight"
import Links from "./Links"
import styles from "./Aside.module.scss"

const Aside = () => {
  return (
    <Grid gap={20} className={styles.aside}>
      <Links />
      <LastHeight />
    </Grid>
  )
}

export default Aside
