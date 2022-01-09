import { FC } from "react"
import styles from "./Overlay.module.scss"

const Overlay: FC = ({ children }) => {
  return <div className={styles.overlay}>{children}</div>
}

export default Overlay
