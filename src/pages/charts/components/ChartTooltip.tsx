import { ChartPoint } from "./Chart"
import styles from "./ChartTooltip.module.scss"

interface Props {
  label: Date
  payload: { payload: ChartPoint }[]
  active: boolean
  formatDate?: (date: Date) => string
}

const ChartTooltip = (props: any) => {
  const { label, payload, active } = props as Props
  const { formatDate = (date) => date.toLocaleDateString() } = props as Props

  if (!active) return null

  const { y } = payload[0].payload

  return (
    <article className={styles.tooltip}>
      <h1 className={styles.value}>{y}</h1>
      <p className={styles.date}>{formatDate(label)}</p>
    </article>
  )
}

export default ChartTooltip
