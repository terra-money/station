import {
  DEFAULT_GAS_ADJUSTMENT,
  CLASSIC_DEFAULT_GAS_ADJUSTMENT,
} from "config/constants"
import themes from "styles/themes/themes"
import { useCallback } from "react"
import { atom, useRecoilState } from "recoil"

export enum SettingKey {
  Theme = "Theme",
  Currency = "Currency",
  CustomNetworks = "CustomNetworks",
  GasAdjustment = "GasAdjustment", // Tx
  ClassicGasAdjustment = "ClassicGasAdjustment",
  AddressBook = "AddressBook", // Send
  HideNonWhitelistTokens = "HideNonWhiteListTokens",
  HideLowBalTokens = "HideLowBalTokens",
  CustomTokens = "CustomTokens", // Wallet
  MinimumValue = "MinimumValue", // Wallet (UST value to show on the list)
  WithdrawAs = "WithdrawAs", // Rewards (Preferred denom to withdraw rewards)
}

const isSystemDarkMode =
  window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches

export const DefaultTheme = themes[Number(isSystemDarkMode)]

export const DefaultCustomTokensItem = { ibc: [], cw20: [], cw721: [] }
const DefaultCustomTokens = { mainnet: DefaultCustomTokensItem }

export const DefaultSettings = {
  [SettingKey.Theme]: DefaultTheme,
  [SettingKey.Currency]: { id: "usd", unit: "$", name: "US Dollar" },
  [SettingKey.CustomNetworks]: [] as CustomNetwork[],
  [SettingKey.GasAdjustment]: DEFAULT_GAS_ADJUSTMENT,
  [SettingKey.ClassicGasAdjustment]: CLASSIC_DEFAULT_GAS_ADJUSTMENT,
  [SettingKey.AddressBook]: [] as AddressBook[],
  [SettingKey.CustomTokens]: DefaultCustomTokens as CustomTokens,
  [SettingKey.MinimumValue]: 0,
  [SettingKey.HideNonWhitelistTokens]: false,
  [SettingKey.HideLowBalTokens]: false,
  [SettingKey.WithdrawAs]: "",
}

export const getLocalSetting = <T>(key: SettingKey): T => {
  const localItem = localStorage.getItem(key)

  if (!localItem) return DefaultSettings[key] as unknown as T

  try {
    return JSON.parse(localItem)
  } catch {
    return localItem as unknown as T
  }
}

export const setLocalSetting = <T>(key: SettingKey, value: T) => {
  const item = typeof value === "string" ? value : JSON.stringify(value)
  localStorage.setItem(key, item)
}

export const hideNoWhitelistState = atom({
  key: "hideNoWhitelistState",
  default: !!getLocalSetting(SettingKey.HideNonWhitelistTokens),
})

export const hideLowBalTokenState = atom({
  key: "hideLowBalTokenState",
  default: !!getLocalSetting(SettingKey.HideLowBalTokens),
})

export const useTokenFilters = () => {
  const [hideNoWhitelist, setHideNoWhitelist] =
    useRecoilState(hideNoWhitelistState)
  const toggleHideNoWhitelist = useCallback(() => {
    setLocalSetting(SettingKey.HideNonWhitelistTokens, !hideNoWhitelist)
    setHideNoWhitelist(!hideNoWhitelist)
  }, [hideNoWhitelist, setHideNoWhitelist])

  const [hideLowBal, setHideLowBal] = useRecoilState(hideLowBalTokenState)
  const toggleHideLowBal = useCallback(() => {
    setLocalSetting(SettingKey.HideLowBalTokens, !hideLowBal)
    setHideLowBal(!hideLowBal)
  }, [hideLowBal, setHideLowBal])

  return {
    hideNoWhitelist,
    toggleHideNoWhitelist,
    toggleHideLowBal,
    hideLowBal,
  }
}
