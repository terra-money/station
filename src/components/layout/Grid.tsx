import { FC, ReactNode } from "react"
import classNames from "classnames/bind"
import styles from "./Grid.module.scss"

const cx = classNames.bind(styles)

export const Row: FC<{ align?: "start" }> = ({ align, children }) => {
  return <div className={cx(styles.row, align)}>{children}</div>
}

interface ColProps {
  span?: number
}

export const Col: FC<ColProps> = ({ span = 1, children }) => {
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
}

const Grid: FC<Props> = ({ gap, className, columns, rows, children }) => {
  const style = {
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
