import { FC } from "react"
import { atom, useRecoilValue } from "recoil"
import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import classNames from "classnames/bind"
import Container from "./Container"
import styles from "./Layout.module.scss"
import { useNav } from "../../app/routes"
import is from "auth/scripts/is"
import { ReactComponent as BackIcon } from "styles/images/icons/Back.svg"

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
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { mobileMenu, deepLinkPage } = useNav()
  const [title, setTitle] = useState("")
  const [subTitle, setSubTitle] = useState("")

  useEffect(() => {
    const currentMenu = mobileMenu.find((a) => a.path === pathname)
    const deeplinkMenu = deepLinkPage.find((a) => a.path === pathname)
    if (currentMenu) {
      setTitle(currentMenu.title)
    } else {
      setTitle("")
    }

    if (deeplinkMenu) {
      setSubTitle(deeplinkMenu.title)
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
                <button onClick={() => navigate(-1)}>
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
