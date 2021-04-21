import { FC } from "react"
import classNames from "classnames/bind"
import styles from "./ExtraActions.module.scss"

const cx = classNames.bind(styles)

interface Props {
  align?: "stretch" | "end" | "center"
}

const ExtraActions: FC<Props> = ({ children, align = "end" }) => {
  return <div className={cx(styles.actions, align)}>{children}</div>
}

export default ExtraActions
