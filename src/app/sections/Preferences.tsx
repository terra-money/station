import { useTranslation } from "react-i18next"
import SettingsIcon from "@mui/icons-material/Settings"
import { ReactComponent as BackIcon } from "styles/images/icons/BackButton.svg"
import { FlexColumn } from "components/layout"
import { sandbox } from "auth/scripts/env"
import HeaderIconButton from "../components/HeaderIconButton"
import NetworkSetting from "./NetworkSetting"
import DisplayChainsSetting from "./DisplayChainsSetting"
import LanguageSetting from "./LanguageSetting"
import CurrencySetting from "./CurrencySetting"
import { useWallet, WalletStatus } from "@terra-money/wallet-kit"
import { ModalButton } from "components/feedback"
import SettingsButton from "components/layout/SettingsButton"
import { useNetwork, useNetworkName } from "data/wallet"
import { useCurrency } from "data/settings/Currency"
import { Languages } from "config/lang"
import { capitalize } from "@mui/material"
import { ReactNode, useState, useEffect } from "react"
import styles from "./Preferences.module.scss"
import SelectTheme from "./SelectTheme"
import LCDSetting from "./LCDSetting"
import { useTheme } from "data/settings/Theme"
import { useDisplayChains } from "utils/localStorage"
import { getDisplayChainsSettingLabel } from "data/queries/chains"
import AdvancedSettings from "./AdvancedSettings"
import { atom, useRecoilState } from "recoil"

type Routes =
  | "network"
  | "lang"
  | "currency"
  | "theme"
  | "lcd"
  | "displayChains"
  | "advanced"

interface SettingsPage {
  key: Routes
  tab: string
  value?: string
  disabled?: boolean
  extra?: ReactNode
  className?: string
}

export const displayChainPrefsOpen = atom({
  key: "displayChainPrefsOpen",
  default: false,
})

const Preferences = () => {
  const { t } = useTranslation()
  const connectedWallet = useWallet()
  const [page, setPage] = useState<Routes | null>()

  const { i18n } = useTranslation()
  const { id: currencyId } = useCurrency()
  const networkName = useNetworkName()
  const network = useNetwork()
  const { name } = useTheme()
  const { displayChains } = useDisplayChains()
  const [isOpen] = useRecoilState(displayChainPrefsOpen)

  useEffect(() => {
    if (isOpen) setPage("displayChains")
  }, [isOpen])

  const routes: Record<Routes, SettingsPage> = {
    network: {
      key: "network",
      tab: t("Network"),
      value: capitalize(networkName),
      disabled: !sandbox && connectedWallet.status === WalletStatus.CONNECTED,
    },
    lang: {
      key: "lang",
      tab: t("Language"),
      value:
        Object.values(Languages ?? {}).find(
          ({ value }) => value === i18n.language
        )?.label ?? Languages.en.label,
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
      value: capitalize(name),
      disabled: false,
    },
    displayChains: {
      key: "displayChains",
      tab: t("Display chains"),
      value: getDisplayChainsSettingLabel(displayChains, network),
      disabled: false,
    },
    advanced: {
      key: "advanced",
      tab: t("Advanced"),
      value: "",
      disabled: false,
      className: styles.advanced,
    },
    lcd: {
      key: "lcd",
      tab: t("Custom LCD"),
      disabled: true, // hide button on the main settings page
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
      case "displayChains":
        return <DisplayChainsSetting />
      case "advanced":
        return <AdvancedSettings />
      default:
        return (
          <FlexColumn gap={8}>
            {Object.values(routes ?? {})
              .filter(({ disabled }) => !disabled)
              .map(({ tab, value, key, className }) => (
                <SettingsButton
                  title={tab}
                  value={value}
                  key={key}
                  className={className}
                  onClick={() => setPage(key)}
                />
              ))}
          </FlexColumn>
        )
    }
  }

  return (
    <ModalButton
      isOpen={isOpen}
      title={
        page ? (
          <>
            <button
              className={styles.back}
              onClick={() =>
                page === "lcd" ? setPage("network") : setPage(null)
              }
            >
              <BackIcon width={18} height={18} />
            </button>
            {routes[page].tab}
          </>
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
