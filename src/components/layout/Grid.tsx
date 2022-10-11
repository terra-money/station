import { CSSProperties, PropsWithChildren, ReactNode } from "react"
import classNames from "classnames/bind"
import styles from "./Grid.module.scss"

const cx = classNames.bind(styles)

export const Row = (props: PropsWithChildren<{ align?: "start" }>) => {
  const { align, children } = props
  return <div className={cx(styles.row, align)}>{children}</div>
}

interface ColProps {
  span?: number
}

export const Col = ({ span = 1, children }: PropsWithChildren<ColProps>) => {
  return (
    <div className={styles.col} style={{ flex: span }}>
      {children}
    </div>
  )
}

interface Props {
  gap?: number
  className?: string
  columns?: number
  rows?: number
  style?: CSSProperties
}

const Grid = (props: PropsWithChildren<Props>) => {
  const { gap, className, columns, rows, children } = props

  const style = {
    ...props.style,
    gap,
    gridTemplateColumns: columns && `repeat(${columns}, 1fr)`,
    gridTemplateRows: rows && `repeat(${rows}, 1fr)`,
  }

  return (
    <div className={classNames(styles.grid, className)} style={style}>
      {children}
    </div>
  )
}

export default Grid

/* derive */
export const Auto = ({ columns }: { columns: [ReactNode, ReactNode] }) => {
  const [component0, component1] = columns

  return (
    <Row align="start">
      <Col span={3}>{component0}</Col>
      <Col span={2}>{component1}</Col>
    </Row>
  )
}
