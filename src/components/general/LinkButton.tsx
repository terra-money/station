import { Link, LinkProps } from "react-router-dom"
import classNames from "classnames"
import { ButtonConfig, getClassName } from "./Button"

const cx = classNames.bind({})

type Props = ButtonConfig & LinkProps

const LinkButton = (props: Props) => {
  const { icon, size, color, outline, block, children, ...attrs } = props
  const className = cx(getClassName(props), props.className)

  return attrs.disabled ? (
    <span {...attrs} className={className}>
      {icon}
      {children}
    </span>
  ) : (
    <Link {...attrs} className={className}>
      {icon}
      {children}
    </Link>
  )
}

export default LinkButton
