import { PropsWithChildren } from "react"
import styles from "./Details.module.scss"

const Details = ({ children }: PropsWithChildren<{}>) => {
  return <div className={styles.component}>{children}</div>
}

export default Details
