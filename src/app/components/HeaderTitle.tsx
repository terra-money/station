import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useLocation } from "react-router-dom"
import { useNav } from "../routes"
import styles from "./HeaderTitle.module.scss"

const HeaderTitle = () => {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const { menu } = useNav()
  const [title, setTitle] = useState("")

  useEffect(() => {
    const currentMenu =
      pathname === "/"
        ? { title: t("Dashboard") }
        : menu.find((a) => a.path === pathname)

    if (currentMenu) {
      setTitle(currentMenu.title)
    } else {
      setTitle("")
    }
  }, [pathname])

  return <h1 className={styles.title}>{title}</h1>
}

export default HeaderTitle
