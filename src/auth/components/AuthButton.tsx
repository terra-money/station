import { ButtonHTMLAttributes } from "react"
import classNames from "classnames/bind"
import styles from "./AuthButton.module.scss"

const cx = classNames.bind(styles)

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  active: boolean
}

const AuthButton = ({ active, ...attrs }: Props) => {
  return (
    <button
      {...attrs}
      type="button"
      className={cx(styles.button, { active }, attrs.className)}
    />
  )
}

export default AuthButton
