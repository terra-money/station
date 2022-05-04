import { useEffect } from "react"
import { NavLink, useLocation } from "react-router-dom"
import { useRecoilState, useSetRecoilState } from "recoil"
import { useTranslation } from "react-i18next"
import classNames from "classnames/bind"
import MenuIcon from "@mui/icons-material/Menu"
import CloseIcon from "@mui/icons-material/Close"
import AutoAwesomeMosaicIcon from "@mui/icons-material/AutoAwesomeMosaic"
import SettingsIcon from "@mui/icons-material/Settings"
import { mobileIsMenuOpenState } from "components/layout"
import { useNav } from "../routes"
import styles from "./Nav.module.scss"

import { ReactComponent as WalletIcon } from "styles/images/menu/Wallet.svg"
import { ReactComponent as SwapIcon } from "styles/images/menu/Swap.svg"
import { ReactComponent as StakeIcon } from "styles/images/menu/Stake.svg"

import is from "auth/scripts/is"
import QRScan from "./QRScan"

const cx = classNames.bind(styles)

const Nav = () => {
  useCloseMenuOnNavigate()
  const { t } = useTranslation()
  const { menu } = useNav()
  const [isOpen, setIsOpen] = useRecoilState(mobileIsMenuOpenState)
  const toggle = () => setIsOpen(!isOpen)
  const ICON_SIZE = { width: 24, height: 24 }

  return (
    <nav>
      <header className={styles.header}>
        <NavLink to="/" className={classNames(styles.item, styles.logo)}>
          <strong>Terra</strong> Station
        </NavLink>

        <NavLink
          to="/wallet"
          className={({ isActive }) =>
            cx(styles.mobileItem, { active: isActive })
          }
        >
          <WalletIcon {...ICON_SIZE} />
        </NavLink>

        <NavLink
          to="/swap"
          className={({ isActive }) =>
            cx(styles.mobileItem, { active: isActive })
          }
        >
          <SwapIcon {...ICON_SIZE} />
        </NavLink>

        <NavLink
          to="/stake"
          className={({ isActive }) =>
            cx(styles.mobileItem, { active: isActive })
          }
        >
          <StakeIcon {...ICON_SIZE} />
        </NavLink>

        <button className={styles.toggle} onClick={toggle}>
          {isOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </header>

      <section className={styles.menu}>
        <div className={classNames(styles.menuTitle)}>
          <NavLink to="/">
            <strong>Terra</strong> Station
          </NavLink>
          {is.mobile() && (
            <>
              {/*<WalletConnect />*/}
              <QRScan />
            </>
          )}
        </div>
        <div className={classNames(styles.menuList)}>
          {is.mobile() && (
            <NavLink
              to={"/"}
              className={({ isActive }) =>
                cx(styles.item, styles.link, { active: isActive })
              }
            >
              <AutoAwesomeMosaicIcon />
              {t("Dashboard")}
            </NavLink>
          )}
          {menu.map(({ path, title, icon }) => (
            <NavLink
              to={path}
              className={({ isActive }) =>
                cx(styles.item, styles.link, { active: isActive })
              }
              key={path}
            >
              {icon}
              {title}
            </NavLink>
          ))}
          {is.mobile() && (
            <NavLink
              to={"/auth"}
              className={({ isActive }) =>
                cx(styles.item, styles.link, { active: isActive })
              }
            >
              <SettingsIcon />
              {t("Settings")}
            </NavLink>
          )}
        </div>
      </section>
    </nav>
  )
}

export default Nav

/* hooks */
const useCloseMenuOnNavigate = () => {
  const { pathname } = useLocation()
  const setIsOpen = useSetRecoilState(mobileIsMenuOpenState)

  useEffect(() => {
    setIsOpen(false)
  }, [pathname, setIsOpen])
}
