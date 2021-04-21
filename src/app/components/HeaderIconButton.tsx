import { ForwardedRef, forwardRef, HTMLAttributes } from "react"
import styles from "./HeaderIconButton.module.scss"

const HeaderIconButton = forwardRef(
  (
    attrs: HTMLAttributes<HTMLButtonElement>,
    ref?: ForwardedRef<HTMLButtonElement>
  ) => {
    return (
      // wrap for tooltip
      <span className={styles.wrapper}>
        <button type="button" {...attrs} className={styles.button} ref={ref} />
      </span>
    )
  }
)

export default HeaderIconButton
