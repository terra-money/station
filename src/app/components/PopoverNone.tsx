import { PropsWithChildren, ReactNode } from "react"
import { Link } from "react-router-dom"
import classNames from "classnames"
import styles from "./PopoverNone.module.scss"

interface Props {
  className?: string
  small?: boolean
  footer?: { children: ReactNode; onClick: () => void; to?: string }
}

const cx = classNames.bind(styles)

const PopoverNone = (props: PropsWithChildren<Props>) => {
  const { className, children, footer } = props

  const renderFooter = () => {
    if (!footer) return null
    const { to } = footer
    if (to) return <Link {...footer} to={to} className={styles.footer} />
    return <button type="button" {...footer} className={styles.footer} />
  }

  return (
    <div className={cx(styles.component, className)}>
      <div className={styles.inner}>{children}</div>
      {renderFooter()}
    </div>
  )
}

export default PopoverNone
