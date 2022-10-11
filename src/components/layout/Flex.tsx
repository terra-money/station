import { CSSProperties, PropsWithChildren } from "react"
import classNames from "classnames/bind"
import styles from "./Flex.module.scss"

const cx = classNames.bind(styles)

interface Props {
  gap?: number
  className?: string
  start?: boolean
  end?: boolean
  wrap?: boolean
  style?: CSSProperties
}

export const InlineFlex = (props: PropsWithChildren<Props>) => {
  const { gap, start, end, wrap, className, children } = props
  return (
    <span
      className={cx(styles.inline, { start, end, wrap }, className)}
      style={{ gap }}
    >
      {children}
    </span>
  )
}

export const FlexColumn = (props: PropsWithChildren<Props>) => {
  const { gap, start, end, wrap, className, children } = props
  return (
    <div
      className={cx(styles.column, { start, end, wrap }, className)}
      style={{ gap }}
    >
      {children}
    </div>
  )
}

const Flex = (props: PropsWithChildren<Props>) => {
  const { gap, start, end, wrap, className, children, style } = props
  return (
    <div
      className={cx(styles.flex, { start, end, wrap }, className)}
      style={{ ...style, gap }}
    >
      {children}
    </div>
  )
}

export default Flex
