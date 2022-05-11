import { FC, ReactNode } from "react"
import classNames from "classnames/bind"
import styles from "./Grid.module.scss"

interface Props {
  className?: string
  button?: ReactNode
}

const GridConfirm: FC<Props> = ({ className, children, button }) => {
  return (
    <div className={classNames(styles.confirm, className)}>
      {children}
      <div className={styles.buttons}>{button}</div>
    </div>
  )
}

export default GridConfirm
