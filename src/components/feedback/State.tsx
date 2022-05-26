import { PropsWithChildren, ReactNode } from "react"
import { Flex, Grid } from "../layout"
import styles from "./State.module.scss"

interface Props {
  icon?: ReactNode
}

const State = ({ icon, children }: PropsWithChildren<Props>) => {
  return (
    <Grid gap={8} className={styles.component}>
      <Flex className={styles.icon}>{icon}</Flex>
      <section className={styles.content}>{children}</section>
    </Grid>
  )
}

export default State
