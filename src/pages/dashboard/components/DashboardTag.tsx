import { PropsWithChildren } from "react"
import styles from "./DashboardTag.module.scss"

const DashboardTag = ({ children }: PropsWithChildren<{}>) => {
  return <span className={styles.tag}>{children}</span>
}

export default DashboardTag
