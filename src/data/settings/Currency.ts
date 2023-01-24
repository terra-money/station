import { atom, useRecoilState, useRecoilValue } from "recoil"
import { SettingKey } from "utils/localStorage"
import { getLocalSetting, setLocalSetting } from "utils/localStorage"

interface Currency {
  id: string
  symbol: string
  name: string
}

export const currencyState = atom({
  key: "currency",
  default: getLocalSetting<Currency>(SettingKey.Currency),
})

export const useCurrency = () => {
  return useRecoilValue(currencyState)
}

export const useCurrencyState = () => {
  const [currency, setCurrency] = useRecoilState(currencyState)

  const set = (currency: Currency) => {
    setLocalSetting(SettingKey.Currency, currency)
    setCurrency(currency)
  }

  return [currency, set] as const
}
