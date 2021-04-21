import classNames from "classnames/bind"
import { Grid } from "../layout"
import Copy from "./Copy"
import styles from "./Pre.module.scss"

const cx = classNames.bind(styles)

interface Props {
  children: any
  copy?: boolean

  /* style */
  height?: number

  /* white-space */
  normal?: boolean
  break?: boolean
}

const Pre = ({ height, children, copy, ...props }: Props) => {
  const text =
    typeof children === "object" ? JSON.stringify(children, null, 2) : children

  return (
    <Grid gap={4}>
      {copy && (
        <aside className={styles.copy}>
          <Copy text={text} />
        </aside>
      )}

      <pre style={{ height }} className={cx(styles.pre, props)}>
        {text}
      </pre>
    </Grid>
  )
}

export default Pre
