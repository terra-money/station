import { useTranslation } from "react-i18next"
import { useWallet } from "@terra-money/wallet-provider"
import { Col, Page } from "components/layout"
import useAuth from "auth/hooks/useAuth"
import AuthList from "auth/components/AuthList"
import BioToggle from "./BioToggle"
import SelectTheme from "app/sections/SelectTheme"
import SelectNetwork from "app/sections/SelectNetwork"
import SelectLanguage from "app/sections/SelectLanguage"
import { isWallet } from "auth"
import styles from "app/sections/MobileItem.module.scss"

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
  const { wallet } = useAuth()

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

  return wallet ? [Network, Language, Theme] : [Language, Theme]
}

const WalletSettings = () => {
  const list = useManageWallet()
  const settingList = useSettings()
  const { disconnect } = useWallet()
  const { wallet } = useAuth()

  return (
    <Page>
      <Col>
        {list && <AuthList list={list} />}
        {settingList && <AuthList list={settingList} />}

        {!wallet && (
          <div className={styles.menuContainer}>
            <button className={styles.menuButton} onClick={disconnect}>
              Disconnect
            </button>
          </div>
        )}
      </Col>
    </Page>
  )
}
export default WalletSettings
