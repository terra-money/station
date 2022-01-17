import { ReactNode } from "react"
import { Link } from "react-router-dom"
import styles from "./AuthList.module.scss"

type Item =
  | { to: string; children: string; icon: ReactNode }
  | { onClick: () => void; children: string; icon: ReactNode }

const AuthList = ({ list }: { list: Item[] }) => {
  const renderItem = ({ children, icon, ...props }: Item) => {
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

  return <div className={styles.list}>{list.map(renderItem)}</div>
}

export default AuthList
