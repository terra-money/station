import { FC } from "react"
import styles from "./Details.module.scss"

const Details: FC = ({ children }) => {
  return <div className={styles.component}>{children}</div>
}

export default Details
