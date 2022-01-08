import { ReactNode } from "react"
import { Link } from "react-router-dom"
import styles from "./AuthList.module.scss"

interface Item {
  to: string
  children: string
  icon: ReactNode
}

const AuthList = ({ list }: { list: Item[] }) => {
  const renderItem = ({ to, children, icon }: Item) => {
    return (
      <Link to={to} className={styles.link} key={to}>
        {children}
        {icon}
      </Link>
    )
  }

  return <div className={styles.list}>{list.map(renderItem)}</div>
}

export default AuthList
