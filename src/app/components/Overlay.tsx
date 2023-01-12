import classNames from "classnames"
import { PropsWithChildren } from "react"
import styles from "./Overlay.module.scss"

const Overlay = ({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) => {
  return <div className={classNames(styles.overlay, className)}>{children}</div>
}

export default Overlay
