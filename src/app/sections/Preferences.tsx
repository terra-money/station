import { useTranslation } from "react-i18next"
import { readDenom } from "@terra.kitchen/utils"
import LanguageIcon from "@mui/icons-material/Language"
import { Languages } from "config/lang"
import { useActiveDenoms } from "data/queries/oracle"
import { useCurrencyState } from "data/settings/Currency"
import { Tabs } from "components/layout"
import { RadioGroup } from "components/form"
import { Popover } from "components/display"
import HeaderIconButton from "../components/HeaderIconButton"

const PreferencesInner = () => {
  const { t, i18n } = useTranslation()

  const { data: activeDenoms = [] } = useActiveDenoms()
  const [currency, setCurrency] = useCurrencyState()

  return (
    <Tabs
      tabs={[
        {
          key: "lang",
          tab: t("Language"),
          children: (
            <RadioGroup
              options={Object.values(Languages)}
              value={i18n.language}
              onChange={(language) => i18n.changeLanguage(language)}
            />
          ),
        },
        {
          key: "currency",
          tab: t("Currency"),
          children: (
            <RadioGroup
              options={activeDenoms.map((denom) => {
                return { value: denom, label: readDenom(denom) }
              })}
              value={currency}
              onChange={setCurrency}
            />
          ),
        },
      ]}
      type="line"
      state
    />
  )
}

const Prefreneces = () => {
  return (
    <Popover content={<PreferencesInner />} placement="bottom">
      <HeaderIconButton>
        <LanguageIcon style={{ fontSize: 18 }} />
      </HeaderIconButton>
    </Popover>
  )
}

export default Prefreneces
