import { FC } from "react"
import styles from "./DashboardTag.module.scss"

const DashboardTag: FC = ({ children }) => {
  return <span className={styles.tag}>{children}</span>
}

export default DashboardTag
