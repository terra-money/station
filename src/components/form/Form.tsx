import { HTMLAttributes, PropsWithChildren, ReactNode } from "react"
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward"
import { Grid } from "../layout"
import styles from "./Form.module.scss"

const Form = (attrs: HTMLAttributes<HTMLFormElement>) => {
  return <form {...attrs} className={`${styles.form} ${attrs.className}`} />
}

export default Form

/* arrow */
export const FormArrow = ({ onClick }: { onClick?: () => void }) => {
  return (
    <div className="center">
      {onClick ? (
        <button type="button" onClick={onClick}>
          <ArrowDownwardIcon />
        </button>
      ) : (
        <ArrowDownwardIcon />
      )}
    </div>
  )
}

/* group */
interface FormGroupProps {
  button?: { onClick: () => void; children: ReactNode }
}

export const FormGroup = (props: PropsWithChildren<FormGroupProps>) => {
  const { children, button } = props

  return (
    <div className={styles.group}>
      {children}
      {button && <button type="button" className={styles.button} {...button} />}
    </div>
  )
}

interface FormItemProps {
  label?: ReactNode
  extra?: ReactNode
  error?: string
  style?: React.CSSProperties
}

/* item */
export const FormItem = (props: PropsWithChildren<FormItemProps>) => {
  const { label, extra, error, children, style } = props

  return (
    <Grid style={style} gap={4}>
      <header className={styles.header}>
        {label && <label className={styles.label}>{label}</label>}
        <aside className={styles.extra}>{extra}</aside>
      </header>

      {children}

      {error && <p className={styles.error}>{error}</p>}
    </Grid>
  )
}
