import {
  DEFAULT_GAS_ADJUSTMENT,
  CLASSIC_DEFAULT_GAS_ADJUSTMENT,
} from "config/constants"
import themes from "styles/themes/themes"
import { useCallback } from "react"
import { useRecoilState } from "recoil"
import { useNetworkName } from "data/wallet"
import {
  hideNoWhitelistState,
  hideLowBalTokenState,
  savedChainState,
  selectedDisplayChainState,
  customLCDState,
  displayChainsState,
  devModeState,
} from "utils/stores"

export enum SettingKey {
  Theme = "Theme",
  Currency = "FiatCurrency",
  CustomNetworks = "CustomNetworks",
  GasAdjustment = "GasAdjustment", // Tx
  ClassicGasAdjustment = "ClassicGasAdjustment",
  AddressBook = "AddressBook", // Send
  HideNonWhitelistTokens = "HideNonWhiteListTokens",
  Chain = "Chain",
  CustomLCD = "CustomLCD",
  HideLowBalTokens = "HideLowBalTokens",
  CustomTokens = "CustomTokens", // Wallet
  MinimumValue = "MinimumValue", // Wallet (UST value to show on the list)
  WithdrawAs = "WithdrawAs", // Rewards (Preferred denom to withdraw rewards)
  EnabledNetworks = "EnabledNetworks",
  NetworkCacheTime = "NetworkCacheTime",
  DisplayChains = "DisplayChains",
  SelectedDisplayChain = "SelectedDisplayChain",
  DevMode = "DevMode",
}

const isSystemDarkMode =
  window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches

export const DefaultTheme = themes[Number(isSystemDarkMode)]

export const DefaultCustomTokensItem = {
  cw20: [],
  cw721: [],
  native: [
    {
      denom: "uluna",
    },
  ],
}
export const DefaultDisplayChains = {
  mainnet: ["phoenix-1", "osmosis-1"],
  testnet: ["pisco-1"],
  classic: ["columbus-5"],
}

export const DefaultCustomTokens = { mainnet: DefaultCustomTokensItem }

export const DefaultSettings = {
  [SettingKey.Theme]: DefaultTheme,
  [SettingKey.Currency]: {
    id: "USD",
    name: "United States Dollar",
    symbol: "$",
  },
  [SettingKey.CustomNetworks]: [] as CustomNetwork[],
  [SettingKey.GasAdjustment]: DEFAULT_GAS_ADJUSTMENT,
  [SettingKey.ClassicGasAdjustment]: CLASSIC_DEFAULT_GAS_ADJUSTMENT,
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

export const useSavedChain = () => {
  const [savedChain, setSavedChain] = useRecoilState(savedChainState)
  const changeSavedChain = useCallback(
    (newChain: string | undefined) => {
      setLocalSetting(SettingKey.Chain, newChain)
      setSavedChain(newChain)
    },
    [setSavedChain]
  )
  return { savedChain, changeSavedChain }
}

export const useSelectedDisplayChain = () => {
  const [selectedDisplayChain, setSelectedChain] = useRecoilState(
    selectedDisplayChainState
  )
  const changeSelectedDisplayChain = useCallback(
    (newChain: string) => {
      setLocalSetting(SettingKey.SelectedDisplayChain, newChain)
      setSelectedChain(newChain)
    },
    [setSelectedChain]
  )
  return { selectedDisplayChain, changeSelectedDisplayChain }
}

export const useDisplayChains = () => {
  const networkName = useNetworkName()
  const [displayChains, setDisplayChains] = useRecoilState(displayChainsState)
  const changeDisplayChains = useCallback(
    (newChains: string[]) => {
      const newDisplayChains = { ...displayChains, [networkName]: newChains }
      setLocalSetting(SettingKey.DisplayChains, newDisplayChains)
      setDisplayChains(newDisplayChains)
    },
    [setDisplayChains, networkName, displayChains]
  )
  return {
    all: displayChains,
    displayChains: displayChains[networkName],
    changeDisplayChains,
  }
}

export const useCustomLCDs = () => {
  const [customLCDs, setCustomLCDs] = useRecoilState(customLCDState)
  function changeCustomLCDs(chainID: string, lcd: string | undefined) {
    const newLCDs = { ...customLCDs, [chainID]: lcd }
    setLocalSetting(SettingKey.CustomLCD, newLCDs)
    setCustomLCDs(newLCDs)
  }
  return { customLCDs, changeCustomLCDs }
}

const toggleSetting = (
  key: SettingKey,
  state: boolean,
  setState: (state: boolean) => void
) => {
  setLocalSetting(key, !state)
  setState(!state)
}

export const useDevMode = () => {
  const [devMode, setDevMode] = useRecoilState(devModeState)
  const changeDevMode = () =>
    toggleSetting(SettingKey.DevMode, devMode, setDevMode)

  return { changeDevMode, devMode }
}

export const useTokenFilters = () => {
  const [hideNoWhitelist, setHideNoWhitelist] =
    useRecoilState(hideNoWhitelistState)
  const toggleHideNoWhitelist = () =>
    toggleSetting(
      SettingKey.HideNonWhitelistTokens,
      hideNoWhitelist,
      setHideNoWhitelist
    )

  const [hideLowBal, setHideLowBal] = useRecoilState(hideLowBalTokenState)
  const toggleHideLowBal = () =>
    toggleSetting(SettingKey.HideLowBalTokens, hideLowBal, setHideLowBal)

  return {
    hideNoWhitelist,
    toggleHideNoWhitelist,
    toggleHideLowBal,
    hideLowBal,
  }
}
