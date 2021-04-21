import { FC } from "react"
import styles from "./Dl.module.scss"

const Dl: FC = ({ children }) => {
  return <dl className={styles.dl}>{children}</dl>
}

export default Dl
