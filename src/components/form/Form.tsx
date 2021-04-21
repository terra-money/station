import { HTMLAttributes, FC, ReactNode } from "react"
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward"
import { Grid } from "../layout"
import styles from "./Form.module.scss"

const Form = (attrs: HTMLAttributes<HTMLFormElement>) => {
  return <form {...attrs} className={styles.form} />
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
export const FormGroup: FC<{
  button?: { onClick: () => void; children: ReactNode }
}> = ({ children, button }) => (
  <div className={styles.group}>
    {children}
    {button && <button type="button" className={styles.button} {...button} />}
  </div>
)

interface FormItemProps {
  label?: string
  extra?: ReactNode
  error?: string
}

/* item */
export const FormItem: FC<FormItemProps> = (props) => {
  const { label, extra, error, children } = props

  return (
    <Grid gap={4}>
      <header className={styles.header}>
        {label && <label className={styles.label}>{label}</label>}
        <aside className={styles.extra}>{extra}</aside>
      </header>

      {children}

      {error && <p className={styles.error}>{error}</p>}
    </Grid>
  )
}
