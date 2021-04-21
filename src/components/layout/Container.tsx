import { FC } from "react"
import classNames from "classnames"
import styles from "./Container.module.scss"

interface Props {
  className?: string
}

const Container: FC<Props> = ({ className, children }) => {
  return (
    <div className={classNames(styles.container, className)}>{children}</div>
  )
}

export default Container
