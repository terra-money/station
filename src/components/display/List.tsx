import { ReactNode } from "react"
import { Link, To } from "react-router-dom"
import { useModal } from "components/feedback"
import { ExternalLink } from "../general"
import styles from "./List.module.scss"

interface InternalLinkItem {
  icon: ReactNode
  children: string
  to: To
}

interface ExternalLinkItem {
  icon: ReactNode
  children: string
  href: string
}

interface ButtonItem {
  src?: string
  children: string
  onClick: () => void
}

type ListProps = (InternalLinkItem | ExternalLinkItem | ButtonItem)[]

const List = ({ list }: { list: ListProps }) => {
  const close = useModal()

  return (
    <section>
      {list.map(({ children, ...item }) => {
        return "to" in item ? (
          <Link
            to={item.to}
            onClick={close}
            className={styles.item}
            key={children}
          >
            {children}
            {item.icon}
          </Link>
        ) : "href" in item ? (
          <ExternalLink href={item.href} className={styles.item} key={children}>
            {children}
            {item.icon}
          </ExternalLink>
        ) : (
          <button
            type="button"
            className={styles.item}
            onClick={item.onClick}
            key={children}
          >
            {children}
            {item.src && <img src={item.src} alt="" width={24} height={24} />}
          </button>
        )
      })}
    </section>
  )
}

export default List

interface Group {
  title: string
  list: ListProps
}

export const ListGroup = ({ groups }: { groups: Group[] }) => {
  return (
    <>
      {groups.map(({ title, list }) => (
        <article className={styles.group} key={title}>
          <h1 className={styles.title}>{title}</h1>
          <List list={list} />
        </article>
      ))}
    </>
  )
}
