import classNames from "classnames"
import { PropsWithChildren } from "react"
import styles from "./Overlay.module.scss"

const cx = classNames.bind(styles)

const Overlay = ({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) => {
  return <div className={cx(styles.overlay, className)}>{children}</div>
}

export default Overlay
