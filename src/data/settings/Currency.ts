import { atom, useRecoilState, useRecoilValue } from "recoil"
import { SettingKey } from "utils/localStorage"
import { getLocalSetting, setLocalSetting } from "utils/localStorage"

export const currencyState = atom({
  key: "currency",
  default: getLocalSetting<string>(SettingKey.Currency),
})

export const useCurrency = () => {
  const currency = useRecoilValue(currencyState)
  return currency
}

export const useCurrencyState = () => {
  const [currency, setCurrency] = useRecoilState(currencyState)

  const set = (currency: string) => {
    setLocalSetting(SettingKey.Currency, currency)
    setCurrency(currency)
  }

  return [currency, set] as const
}
