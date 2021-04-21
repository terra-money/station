import { HTMLAttributes, ReactNode } from "react"
import { Link, LinkProps } from "react-router-dom"
import classNames from "classnames/bind"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import styles from "./Internal.module.scss"

const cx = classNames.bind(styles)

interface Props {
  icon?: ReactNode
  chevron?: boolean
  disabled?: boolean
}

interface InternalButtonProps
  extends Props,
    HTMLAttributes<HTMLButtonElement> {}

export const InternalButton = (props: InternalButtonProps) => {
  return <button {...render(props)} type="button" />
}

interface InternalLinkProps extends Props, LinkProps {}

export const InternalLink = (props: InternalLinkProps) => {
  return props.disabled ? (
    <span {...render(props)} />
  ) : (
    <Link {...render(props)} />
  )
}

/* helpers */
function render<T extends InternalLinkProps | InternalButtonProps>(props: T) {
  const { icon, chevron, className, children, disabled, ...attrs } = props

  return {
    ...attrs,
    className: cx(styles.item, { disabled }, className),
    children: (
      <>
        <span className={styles.icon}>{icon}</span>
        {children}
        {chevron && (
          <span className={styles.chevron}>
            <ChevronRightIcon style={{ fontSize: 16 }} />
          </span>
        )}
      </>
    ),
  }
}
