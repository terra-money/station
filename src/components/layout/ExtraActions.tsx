import { PropsWithChildren } from "react"
import classNames from "classnames/bind"
import styles from "./ExtraActions.module.scss"

const cx = classNames.bind(styles)

interface Props {
  align?: "stretch" | "end" | "center"
}

const ExtraActions = ({ children, ...props }: PropsWithChildren<Props>) => {
  const { align = "end" } = props
  return <div className={cx(styles.actions, align)}>{children}</div>
}

export default ExtraActions
