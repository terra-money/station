import { PropsWithChildren } from "react"
import { atom, useRecoilValue } from "recoil"
import { useTheme } from "data/settings/Theme"
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
  const { name } = useTheme()

  return (
    <div className={styles.sidebar}>
      {name === "blossom" && (
        <>
          <div className={styles.background_blur_blossom} />
          <div className={styles.background_blur_blossom2} />
          <div className={styles.background_blur_blossom3} />
        </>
      )}
      {children}
    </div>
  )
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
