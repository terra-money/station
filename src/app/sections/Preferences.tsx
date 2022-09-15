import { useTranslation } from "react-i18next"
import LanguageIcon from "@mui/icons-material/Language"
import { useIsClassic } from "data/query"
import { Tabs } from "components/layout"
import { Popover } from "components/display"
import { sandbox } from "auth/scripts/env"
import PopoverNone from "../components/PopoverNone"
import HeaderIconButton from "../components/HeaderIconButton"
import NetworkSetting from "./NetworkSetting"
import LanguageSetting from "./LanguageSetting"

const Preferences = () => {
  const { t } = useTranslation()
  const isClassic = useIsClassic()

  const network = {
    key: "network",
    tab: t("Network"),
    children: <NetworkSetting />,
    condition: ["sandbox"],
  }

  const lang = {
    key: "lang",
    tab: t("Language"),
    children: <LanguageSetting />,
    condition: undefined,
  }

  const tabs = [network, lang].filter(({ condition }) => {
    if (!condition) return true
    if (condition.includes("sandbox")) return sandbox
    if (condition.includes("classic")) return isClassic
    return true
  })

  return (
    <Popover
      content={
        <PopoverNone>
          <Tabs tabs={tabs} type="line" state />
        </PopoverNone>
      }
      placement="bottom"
      theme="none"
    >
      <HeaderIconButton>
        <LanguageIcon style={{ fontSize: 18 }} />
      </HeaderIconButton>
    </Popover>
  )
}

export default Preferences
