import { PropsWithChildren } from "react"
import styles from "./Overlay.module.scss"

const Overlay = ({ children }: PropsWithChildren<{}>) => {
  return <div className={styles.overlay}>{children}</div>
}

export default Overlay
