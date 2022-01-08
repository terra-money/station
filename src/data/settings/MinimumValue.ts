import { useTranslation } from "react-i18next"
import { atom, useRecoilState } from "recoil"
import { getLocalSetting, setLocalSetting } from "utils/localStorage"
import { SettingKey } from "utils/localStorage"

const minimumValueState = atom({
  key: "minimumValueState",
  default: getLocalSetting<number>(SettingKey.MinimumValue),
})

export const useMinimumValue = () => {
  const { t } = useTranslation()
  const [minimumValue, setMinimumValue] = useRecoilState(minimumValueState)

  const set = (value: number) => {
    setLocalSetting<number>(SettingKey.MinimumValue, value)
    setMinimumValue(value)
  }

  const list = [
    { value: 0, label: t("Show all") },
    { value: 1, label: t("Hide <$1") },
    { value: 10, label: t("Hide <$10") },
    { value: 100, label: t("Hide <$100") },
  ]

  return [minimumValue, set, list] as const
}
