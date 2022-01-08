import { FC } from "react"
import classNames from "classnames"
import styles from "./Dl.module.scss"

const Dl: FC<{ className?: string }> = ({ children, className }) => {
  return <dl className={classNames(styles.dl, className)}>{children}</dl>
}

export default Dl
