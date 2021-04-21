import { ForwardedRef, forwardRef, SelectHTMLAttributes } from "react"
import classNames from "classnames/bind"
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown"
import styles from "./Select.module.scss"

const cx = classNames.bind(styles)

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  small?: boolean
  before?: boolean
}

const Select = forwardRef(
  (
    { small, before, ...attrs }: Props,
    ref: ForwardedRef<HTMLSelectElement>
  ) => {
    const className = cx(styles.select, { small, before })

    return (
      <div className={classNames(styles.wrapper, attrs.className)}>
        <select {...attrs} className={className} ref={ref} />
        <ArrowDropDownIcon style={{ fontSize: 18 }} className={styles.caret} />
      </div>
    )
  }
)

export default Select
