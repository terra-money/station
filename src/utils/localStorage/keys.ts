import { DEFAULT_GAS_ADJUSTMENT } from "config/constants"

import themes from "styles/themes/themes"
import { CustomNetwork } from "types/network"

export enum SettingKey {
  Theme = "Theme",
  Currency = "FiatCurrency",
  CustomNetworks = "CustomNetworks",
  GasAdjustment = "GasAdjust", // Tx
  AddressBook = "AddressBook", // Send
  HideNonWhitelistTokens = "HideNonWhiteListTokens",
  Chain = "Chain",
  CustomLCD = "CustomLCD",
  HideLowBalTokens = "HideLowBalTokens",
  CustomTokens = "CustomTokensInterchain", // Wallet
  MinimumValue = "MinimumValue", // Wallet (UST value to show on the list)
  WithdrawAs = "WithdrawAs", // Rewards (Preferred denom to withdraw rewards)
  EnabledNetworks = "EnabledNetworks",
  NetworkCacheTime = "NetworkCacheTime",
  DisplayChains = "DisplayChains",
  SelectedDisplayChain = "SelectedDisplayChain",
  DevMode = "DevMode",
}

export const isSystemDarkMode =
  window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches

export const DefaultTheme = themes[1]

export const DefaultCustomTokensItem = (chainID: string) => ({
  cw20: [],
  cw721: [],
  native: [
    {
      denom: "uluna",
      id: `${chainID}:uluna`,
    },
  ],
})

export const DefaultDisplayChains = {
  mainnet: ["phoenix-1", "osmosis-1"],
  testnet: ["pisco-1"],
  classic: ["columbus-5"],
  localterra: ["localterra"],
}

export const DefaultCustomTokens = {
  mainnet: DefaultCustomTokensItem("phoenix-1"),
}

export const DefaultSettings = {
  [SettingKey.Theme]: DefaultTheme,
  [SettingKey.Currency]: {
    id: "USD",
    name: "United States Dollar",
    symbol: "$",
  },
  [SettingKey.CustomNetworks]: [] as CustomNetwork[],
  [SettingKey.GasAdjustment]: DEFAULT_GAS_ADJUSTMENT,
  [SettingKey.AddressBook]: [] as AddressBook[],
  [SettingKey.CustomTokens]: DefaultCustomTokens as CustomTokens,
  [SettingKey.MinimumValue]: 0,
  [SettingKey.NetworkCacheTime]: 0,
  [SettingKey.HideNonWhitelistTokens]: true,
  [SettingKey.DevMode]: false,
  [SettingKey.HideLowBalTokens]: true,
  [SettingKey.WithdrawAs]: "",
  [SettingKey.Chain]: "",
  [SettingKey.EnabledNetworks]: { time: 0, networks: [] as string[] },
  [SettingKey.CustomLCD]: {},
  [SettingKey.DisplayChains]: DefaultDisplayChains,
  [SettingKey.SelectedDisplayChain]: "",
}
