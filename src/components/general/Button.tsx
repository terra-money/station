import { ButtonHTMLAttributes, ForwardedRef, ReactNode } from "react"
import { forwardRef } from "react"
import classNames from "classnames/bind"
import { LoadingCircular } from "../feedback"
import styles from "./Button.module.scss"

const cx = classNames.bind(styles)

export interface ButtonConfig {
  icon?: ReactNode
  size?: "small"
  color?: "default" | "primary" | "danger"
  outline?: boolean
  block?: boolean
  loading?: boolean
  disabled?: boolean
}

type Props = ButtonConfig & ButtonHTMLAttributes<HTMLButtonElement>

const Button = forwardRef(
  ({ children, ...props }: Props, ref?: ForwardedRef<HTMLButtonElement>) => {
    const { icon, size, color, outline, block, loading, ...attrs } = props
    const className = classNames(getClassName(props), props.className)

    return (
      <button type="button" {...attrs} className={className} ref={ref}>
        {loading ? <LoadingCircular size={16} /> : icon}
        {children}
      </button>
    )
  }
)

export default Button

/* helpers */
export const getClassName = (props: ButtonConfig) => {
  const { size, outline, block, disabled, loading } = props
  const color = props.color ?? (!outline && "default")
  return cx(styles.button, size, color, { outline, block, disabled, loading })
}
