import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useWallet } from "@terra-money/wallet-provider"
import classNames from "classnames/bind"

import { Col, Page } from "components/layout"
import useAuth from "auth/hooks/useAuth"
import AuthList from "auth/components/AuthList"
import BioToggle from "./BioToggle"
import SelectTheme from "app/sections/SelectTheme"
import SelectNetwork from "app/sections/SelectNetwork"
import SelectLanguage from "app/sections/SelectLanguage"
import { isWallet } from "auth"
import styles from "app/sections/MobileItem.module.scss"
import { getVersion } from "utils/rnModule"

export const useManageWallet = () => {
  const { t } = useTranslation()
  const { wallet } = useAuth()

  const BioAuth = {
    children: t("Use Bio Auth"),
    icon: <BioToggle />,
  }

  if (!wallet || isWallet.ledger(wallet)) return

  return [BioAuth]
}

export const useSettings = () => {
  const { t } = useTranslation()

  const Network = {
    children: t("Network"),
    icon: <SelectNetwork />,
  }

  const Language = {
    children: t("Language"),
    icon: <SelectLanguage />,
  }

  const Theme = {
    children: t("Theme"),
    icon: <SelectTheme />,
  }

  const Version = {
    children: t("Version"),
    icon: <AppVersion />,
  }

  return isWallet.mobileNative()
    ? [Network, Language, Theme, Version]
    : [Language, Theme]
}

const AppVersion = () => {
  const [version, setVersion] = useState("")

  useEffect(() => {
    getVersion().then((res: any) => {
      setVersion(res)
    })
  }, [])

  return <p>{version}</p>
}

const cx = classNames.bind(styles)

const WalletSettings = () => {
  const { t } = useTranslation()
  const list = useManageWallet()
  const settingList = useSettings()
  const { disconnect } = useWallet()
  const { wallet } = useAuth()
  const navigate = useNavigate()

  return (
    <Page>
      <Col>
        {list && <AuthList list={list} />}
        {settingList && <AuthList list={settingList} />}

        <div className={styles.menuContainer}>
          {!wallet && !isWallet.mobileNative() && (
            <button className={styles.menuButton} onClick={disconnect}>
              {t("Disconnect")}
            </button>
          )}

          {wallet && isWallet.mobileNative() && (
            <button
              className={cx(styles.menuButton, { red: true })}
              onClick={() => {
                navigate("/auth/delete")
              }}
            >
              {t("Delete wallet")}
            </button>
          )}
        </div>
      </Col>
    </Page>
  )
}
export default WalletSettings
