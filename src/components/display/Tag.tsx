import { FC } from "react"
import classNames from "classnames/bind"
import { Color } from "types/components"
import { InlineFlex } from "../layout"
import styles from "./Tag.module.scss"

const cx = classNames.bind(styles)

interface Props {
  color: Color
  small?: boolean
}

const Tag: FC<Props> = ({ color, small, children }) => {
  const className = classNames(styles.tag, `bg-${color}`, cx({ small }))
  return <InlineFlex className={className}>{children}</InlineFlex>
}

export default Tag
