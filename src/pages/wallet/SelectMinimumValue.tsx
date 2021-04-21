import { useTranslation } from "react-i18next"
import { useMinimumValue } from "data/settings/MinimumValue"
import { Select } from "components/form"

const SelectMinimumValue = () => {
  const { t } = useTranslation()
  const [value, set] = useMinimumValue()

  return (
    <Select value={value} onChange={(e) => set(Number(e.target.value))} small>
      <option value="0">{t("Show all")}</option>
      <option value="1">{t("Hide <$1")}</option>
      <option value="10">{t("Hide <$10")}</option>
      <option value="100">{t("Hide <$100")}</option>
    </Select>
  )
}

export default SelectMinimumValue
