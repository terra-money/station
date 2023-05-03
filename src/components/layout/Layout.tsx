import { PropsWithChildren } from "react"
import { atom, useRecoilValue } from "recoil"
import classNames from "classnames/bind"
import styles from "./Layout.module.scss"

const cx = classNames.bind(styles)

export const mobileIsMenuOpenState = atom({
  key: "mobileIsMenuOpen",
  default: false,
})

/* components */
export const Banner = ({ children }: PropsWithChildren<{}>) => {
  return <div className={styles.banner}>{children}</div>
}

export const Sidebar = ({ children }: PropsWithChildren<{}>) => {
  return <div className={styles.sidebar}>{children}</div>
}

export const MainContainer = ({ children }: PropsWithChildren<{}>) => {
  return <div className={styles.maincontainer}>{children}</div>
}

export const Page = ({ children }: PropsWithChildren<{}>) => {
  return <div className={styles.page}>{children}</div>
}

export const Header = ({ children }: PropsWithChildren<{}>) => {
  return (
    <header className={styles.header}>
      <div className={styles.wrapper}>{children}</div>
    </header>
  )
}

export const Actions = ({ children }: PropsWithChildren<{}>) => {
  return <div className={styles.actions}>{children}</div>
}

export const Content = ({ children }: PropsWithChildren<{}>) => {
  return <main className={styles.main}>{children}</main>
}

const Layout = ({ children }: PropsWithChildren<{}>) => {
  const isMenuOpen = useRecoilValue(mobileIsMenuOpenState)

  return (
    <div className={cx(styles.layout, { menu: isMenuOpen })}>{children}</div>
  )
}

export default Layout
