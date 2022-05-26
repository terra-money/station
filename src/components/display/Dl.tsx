import { PropsWithChildren } from "react"
import classNames from "classnames"
import styles from "./Dl.module.scss"

const Dl = (props: PropsWithChildren<{ className?: string }>) => {
  const { children, className } = props
  return <dl className={classNames(styles.dl, className)}>{children}</dl>
}

export default Dl
