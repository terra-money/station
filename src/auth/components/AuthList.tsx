import { ReactNode } from "react"
import { Link } from "react-router-dom"
import styles from "./AuthList.module.scss"
import classNames from "classnames/bind"

const cx = classNames.bind(styles)

type Item =
  | { to: string; children: string; icon: ReactNode }
  | { onClick: () => void; children: string; icon: ReactNode }
  | { children: string; icon: ReactNode }

const AuthList = ({ list, isModal }: { list: Item[]; isModal?: boolean }) => {
  const className = cx(styles.list, { isModal })

  const renderItem = ({ children, icon, ...props }: Item) => {
    if (!("onClick" in props) && !("to" in props)) {
      return (
        <button className={styles.link} key={children}>
          {children}
          {icon && <div className={styles.action}>{icon}</div>}
        </button>
      )
    }

    if ("onClick" in props) {
      const { onClick } = props
      return (
        <button className={styles.link} onClick={onClick} key={children}>
          {children}
          {icon}
        </button>
      )
    }

    const { to } = props
    return (
      <Link to={to} className={styles.link} key={children}>
        {children}
        {icon}
      </Link>
    )
  }

  return <div className={className}>{list.map(renderItem)}</div>
}

export default AuthList
