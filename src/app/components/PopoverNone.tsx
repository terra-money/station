import { FC, ReactNode } from "react"
import { Link } from "react-router-dom"
import styles from "./PopoverNone.module.scss"

interface Props {
  footer?: { children: ReactNode; onClick: () => void; to?: string }
}

const PopoverNone: FC<Props> = ({ children, footer }) => {
  const renderFooter = () => {
    if (!footer) return null
    const { to } = footer
    if (to) return <Link {...footer} to={to} className={styles.footer} />
    return <button type="button" {...footer} className={styles.footer} />
  }

  return (
    <div className={styles.component}>
      <div className={styles.inner}>{children}</div>
      {renderFooter()}
    </div>
  )
}

export default PopoverNone
