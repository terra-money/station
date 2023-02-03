import { useTranslation } from "react-i18next"
import SettingsIcon from "@mui/icons-material/Settings"
import { ReactComponent as BackIcon } from "styles/images/icons/BackButton.svg"
import { FlexColumn } from "components/layout"
import { sandbox } from "auth/scripts/env"
import HeaderIconButton from "../components/HeaderIconButton"
import NetworkSetting from "./NetworkSetting"
import LanguageSetting from "./LanguageSetting"
import CurrencySetting from "./CurrencySetting"
import { useWallet, WalletStatus } from "@terra-money/wallet-provider"
import { ModalButton } from "components/feedback"
import SettingsButton from "components/layout/SettingsButton"
import { useNetworkName } from "data/wallet"
import { useCurrency } from "data/settings/Currency"
import { Languages } from "config/lang"
import { capitalize } from "@mui/material"
import { useState } from "react"
import styles from "./Preferences.module.scss"
import SelectTheme from "./SelectTheme"
import LCDSetting from "./LCDSetting"

type Routes = "network" | "lang" | "currency" | "theme" | "lcd"
interface SettingsPage {
  key: Routes
  tab: string
  value?: string
  disabled?: boolean
}

const Preferences = () => {
  const { t } = useTranslation()
  const connectedWallet = useWallet()
  const [page, setPage] = useState<Routes | null>(null)

  const { i18n } = useTranslation()
  const { id: currencyId } = useCurrency()
  const networkName = useNetworkName()

  const routes: Record<Routes, SettingsPage> = {
    network: {
      key: "network",
      tab: t("Network"),
      value: capitalize(networkName),
      disabled:
        !sandbox && connectedWallet.status === WalletStatus.WALLET_CONNECTED,
    },
    lang: {
      key: "lang",
      tab: t("Language"),
      value:
        Object.values(Languages).find(({ value }) => value === i18n.language)
          ?.label ?? Languages.en.label,
      disabled: false,
    },
    currency: {
      key: "currency",
      tab: t("Currency"),
      value: currencyId,
      disabled: false,
    },
    theme: {
      key: "theme",
      tab: t("Theme"),
      value: "Dark",
      disabled: false,
    },
    lcd: {
      key: "lcd",
      tab: t("Custom LCD"),
      // hide button on the main settings page
      disabled: true,
    },
  }

  function renderSettings() {
    switch (page) {
      case "network":
        return (
          <FlexColumn gap={16}>
            <NetworkSetting />
            <div className={styles.button__container}>
              <SettingsButton
                title="Custom LCD"
                onClick={() => setPage("lcd")}
              />
            </div>
          </FlexColumn>
        )
      case "currency":
        return <CurrencySetting />
      case "lang":
        return <LanguageSetting />
      case "theme":
        return <SelectTheme />
      case "lcd":
        return <LCDSetting />
      default:
        return (
          <FlexColumn gap={8}>
            {Object.values(routes)
              .filter(({ disabled }) => !disabled)
              .map(({ tab, value, key }) => (
                <SettingsButton
                  title={tab}
                  value={value}
                  key={key}
                  onClick={() => setPage(key)}
                />
              ))}
          </FlexColumn>
        )
    }
  }

  return (
    <ModalButton
      title={
        page ? (
          <div>
            <button
              className={styles.back}
              onClick={() =>
                page === "lcd" ? setPage("network") : setPage(null)
              }
            >
              <BackIcon width={18} height={18} />
            </button>
            {routes[page].tab}
          </div>
        ) : (
          t("Settings")
        )
      }
      renderButton={(open) => (
        <HeaderIconButton
          onClick={() => {
            open()
            setPage(null)
          }}
        >
          <SettingsIcon style={{ fontSize: 18 }} />
        </HeaderIconButton>
      )}
    >
      {renderSettings()}
    </ModalButton>
  )
}

export default Preferences
