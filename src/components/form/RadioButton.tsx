import { ForwardedRef, forwardRef, InputHTMLAttributes } from "react"
import classNames from "classnames/bind"
import styles from "./RadioButton.module.scss"

const cx = classNames.bind(styles)

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  value: string
  checked: boolean
}

const RadioButton = forwardRef(
  (
    { value, checked, children, ...attrs }: Props,
    ref: ForwardedRef<HTMLInputElement>
  ) => {
    return (
      <label className={cx(styles.radio, { checked })}>
        <input {...attrs} value={value} type="radio" ref={ref} hidden />
        <span>{children}</span>
      </label>
    )
  }
)

export default RadioButton
