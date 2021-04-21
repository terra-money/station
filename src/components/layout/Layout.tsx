import { FC } from "react"
import { atom, useRecoilValue } from "recoil"
import classNames from "classnames/bind"
import Container from "./Container"
import styles from "./Layout.module.scss"

const cx = classNames.bind(styles)

export const mobileIsMenuOpenState = atom({
  key: "mobileIsMenuOpen",
  default: false,
})

/* components */
export const Banner: FC = ({ children }) => {
  return <div className={styles.banner}>{children}</div>
}

export const Sidebar: FC = ({ children }) => {
  return <div className={styles.sidebar}>{children}</div>
}

export const Header: FC = ({ children }) => {
  return (
    <header className={styles.header}>
      <Container className={styles.container}>
        <div className={styles.wrapper}>{children}</div>
      </Container>
    </header>
  )
}

export const Content: FC = ({ children }) => {
  return <main className={styles.main}>{children}</main>
}

const Layout: FC = ({ children }) => {
  const isMenuOpen = useRecoilValue(mobileIsMenuOpenState)

  return (
    <div className={cx(styles.layout, { menu: isMenuOpen })}>{children}</div>
  )
}

export default Layout
