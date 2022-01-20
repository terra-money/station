import themes from "styles/themes/themes"

export enum SettingKey {
  Theme = "Theme",
  Currency = "Currency",
  MinimumValue = "MinimumValue",
  CustomTokens = "CustomTokens",
  CustomNetworks = "CustomNetworks",
  AddressBook = "AddressBook",
}

const isSystemDarkMode =
  window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches

export const DefaultTheme = themes[Number(isSystemDarkMode)]

const DefaultCustomTokens = {
  mainnet: { ibc: [], cw20: [], cw721: [] },
  testnet: { ibc: [], cw20: [], cw721: [] },
}

export const DefaultSettings = {
  [SettingKey.Theme]: DefaultTheme,
  [SettingKey.Currency]: "uusd",
  [SettingKey.MinimumValue]: 0,
  [SettingKey.CustomTokens]: DefaultCustomTokens as CustomTokens,
  [SettingKey.CustomNetworks]: [] as CustomNetwork[],
  [SettingKey.AddressBook]: [] as AddressBook[],
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
