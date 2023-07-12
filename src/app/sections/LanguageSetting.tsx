import { useTranslation } from "react-i18next"
import { Languages } from "config/lang"
import SettingsSelector from "components/layout/SettingsSelector"

const LanguageSetting = () => {
  const { i18n } = useTranslation()

  return (
    <SettingsSelector
      options={Object.values(Languages ?? {})}
      value={i18n.language}
      onChange={(language) => i18n.changeLanguage(language)}
    />
  )
}

export default LanguageSetting
