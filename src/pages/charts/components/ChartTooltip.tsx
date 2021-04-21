import { ChartPoint } from "./Chart"
import styles from "./ChartTooltip.module.scss"

const ChartTooltip = ({ label, payload, active }: any) => {
  if (!active) return null
  const { y } = payload[0].payload as ChartPoint

  return (
    <article className={styles.tooltip}>
      <h1 className={styles.value}>{y}</h1>
      <p className={styles.date}>{label.toDateString()}</p>
    </article>
  )
}

export default ChartTooltip
