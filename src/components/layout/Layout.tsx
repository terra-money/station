import { PropsWithChildren } from "react"
import { atom, useRecoilValue } from "recoil"
import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import classNames from "classnames/bind"
import Container from "./Container"
import styles from "./Layout.module.scss"
import { useNav } from "../../app/routes"
import is from "auth/scripts/is"
import { ReactComponent as BackIcon } from "styles/images/icons/Back.svg"
import SelectSend from "../../txs/send/SelectSend"

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

export const Header = ({ children }: PropsWithChildren<{}>) => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { mobileMenu, subPage } = useNav()
  const [title, setTitle] = useState("")
  const [subTitle, setSubTitle] = useState("")

  useEffect(() => {
    const subPages = [
      ...subPage,
      {
        path: "/auth/ledger/device",
        title: "Select a ledger device",
      },
    ]

    const subMenu = subPages.find((a) => a.path === pathname)
    const currentMenu = mobileMenu.find((a) => a.path === pathname)

    if (currentMenu) {
      setTitle(currentMenu.title)
    } else {
      setTitle("")
    }

    if (subMenu) {
      setSubTitle(subMenu.title)
    } else {
      setSubTitle("")
    }
  }, [pathname])

  return (
    <header className={cx(styles.header, { subPage: !title })}>
      <Container className={styles.container}>
        <div className={styles.wrapper}>
          {is.mobile() ? (
            title ? (
              <>
                <h1>{title}</h1>
                {children}
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    if (window.history.length <= 1) {
                      navigate("/", { replace: true })
                    } else {
                      navigate(-1)
                    }
                  }}
                >
                  <BackIcon {...{ width: 24, height: 24 }} />
                </button>
                {subTitle && (
                  <>
                    <h1>{subTitle}</h1>
                    <button />
                  </>
                )}
              </>
            )
          ) : (
            children
          )}
        </div>
      </Container>
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
