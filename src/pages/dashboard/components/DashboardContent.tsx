import { ReactNode } from "react"
import { Grid } from "components/layout"
import styles from "./DashboardContent.module.scss"

interface Props {
  value: ReactNode
  footer?: ReactNode
}

const DashboardContent = ({ value, footer }: Props) => {
  return (
    <Grid gap={32}>
      <section className={styles.value}>{value}</section>
      {footer && <footer className={styles.footer}>{footer}</footer>}
    </Grid>
  )
}

export default DashboardContent
