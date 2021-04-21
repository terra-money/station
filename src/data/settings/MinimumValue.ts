import { atom, useRecoilState } from "recoil"
import { getLocalSetting, setLocalSetting } from "utils/localStorage"
import { SettingKey } from "utils/localStorage"

const minimumValueState = atom({
  key: "minimumValueState",
  default: getLocalSetting<number>(SettingKey.MinimumValue),
})

export const useMinimumValue = () => {
  const [minimumValue, setMinimumValue] = useRecoilState(minimumValueState)

  const set = (value: number) => {
    setLocalSetting<number>(SettingKey.MinimumValue, value)
    setMinimumValue(value)
  }

  return [minimumValue, set] as const
}
