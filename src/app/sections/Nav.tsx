import { useEffect, useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import { useRecoilState, useSetRecoilState } from "recoil"
import { useTranslation } from "react-i18next"
import classNames from "classnames/bind"
import { mobileIsMenuOpenState } from "components/layout"
import { useNav } from "../routes"
import styles from "./Nav.module.scss"

import { ReactComponent as MenuIcon } from "styles/images/menu/Menu.svg"
import { ReactComponent as WalletIcon } from "styles/images/menu/Wallet.svg"
import { ReactComponent as SwapIcon } from "styles/images/menu/Swap.svg"
import { ReactComponent as StakeIcon } from "styles/images/menu/Stake.svg"

import is from "auth/scripts/is"
import QRScan from "./QRScan"
import { useIsClassic } from "../../data/query"

const cx = classNames.bind(styles)

const Nav = () => {
  useCloseMenuOnNavigate()
  const { t } = useTranslation()
  const { menu, mobileMenu, subPage } = useNav()
  const [isOpen, setIsOpen] = useRecoilState(mobileIsMenuOpenState)
  const toggle = () => setIsOpen(!isOpen)
  const close = () => setIsOpen(false)
  const ICON_SIZE = { width: 28, height: 28 }
  const isClassic = useIsClassic()
  const { pathname } = useLocation()
  const [buttonView, setButtonView] = useState(true)
  const [isNeedMoreBtn, setIsNeedMoreBtn] = useState(false)

  const mainButtons = ["/wallet", "/swap", "/stake"]

  useEffect(() => {
    const subMenu = subPage.find((a) => a.path === pathname)
    const isMain = mainButtons.find((a) => a === pathname)
    if (isMain) {
      setIsNeedMoreBtn(false)
    } else {
      setIsNeedMoreBtn(true)
    }

    if (subMenu) {
      setButtonView(false)
    } else {
      setButtonView(true)
    }
  }, [pathname])

  return buttonView ? (
    <nav>
      <header className={styles.header}>
        <NavLink to="/" className={classNames(styles.item, styles.logo)}>
          <strong>Terra</strong> Station
        </NavLink>

        <NavLink
          to="/wallet"
          onClick={close}
          className={({ isActive }) =>
            cx(styles.mobileItem, { active: isActive && !isOpen })
          }
        >
          <>
            <WalletIcon {...ICON_SIZE} />
            {t("WALLET")}
          </>
        </NavLink>

        {isClassic && (
          <NavLink
            to="/swap"
            onClick={close}
            className={({ isActive }) =>
              cx(styles.mobileItem, { active: isActive && !isOpen })
            }
          >
            <>
              <SwapIcon {...ICON_SIZE} />
              {t("SWAP")}
            </>
          </NavLink>
        )}

        <NavLink
          to="/stake"
          onClick={close}
          className={({ isActive }) =>
            cx(styles.mobileItem, { active: isActive && !isOpen })
          }
        >
          <>
            <StakeIcon {...ICON_SIZE} />
            {t("STAKE")}
          </>
        </NavLink>

        <button
          className={cx(styles.toggle, styles.mobileItem, {
            active: isOpen || isNeedMoreBtn,
          })}
          onClick={toggle}
        >
          <MenuIcon {...ICON_SIZE} />
          {t("MORE")}
        </button>
      </header>

      <section className={styles.menu}>
        <div className={classNames(styles.menuTitle)}>
          <NavLink to="/" onClick={close}>
            <strong>Terra</strong> Station
          </NavLink>
          {is.mobileNative() && (
            <>
              <QRScan />
            </>
          )}
        </div>
        <div className={classNames(styles.menuList)}>
          {(is.mobile() ? mobileMenu : menu).map(({ path, title, icon }) => (
            <NavLink
              to={path}
              className={cx(styles.item, styles.link)}
              key={path}
              onClick={close}
            >
              {icon}
              {title}
            </NavLink>
          ))}
        </div>
      </section>
    </nav>
  ) : (
    <></>
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
