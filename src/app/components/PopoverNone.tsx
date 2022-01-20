import { FC, ReactNode } from "react"
import { Link } from "react-router-dom"
import classNames from "classnames"
import styles from "./PopoverNone.module.scss"

interface Props {
  className?: string
  footer?: { children: ReactNode; onClick: () => void; to?: string }
}

const PopoverNone: FC<Props> = ({ className, children, footer }) => {
  const renderFooter = () => {
    if (!footer) return null
    const { to } = footer
    if (to) return <Link {...footer} to={to} className={styles.footer} />
    return <button type="button" {...footer} className={styles.footer} />
  }

  return (
    <div className={classNames(styles.component, className)}>
      <div className={styles.inner}>{children}</div>
      {renderFooter()}
    </div>
  )
}

export default PopoverNone
