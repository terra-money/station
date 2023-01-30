import { Grid } from "components/layout"
import Links from "./Links"
import styles from "./Aside.module.scss"

const Aside = () => {
  return (
    <Grid gap={20} className={styles.aside}>
      <Links />
    </Grid>
  )
}

export default Aside
