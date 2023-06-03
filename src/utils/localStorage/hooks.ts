import { useCallback } from "react"
import { useRecoilState } from "recoil"
import { SettingKey, DefaultSettings } from "utils/localStorage"
import { useNetworkName } from "data/wallet"
import {
  hideNoWhitelistState,
  hideLowBalTokenState,
  savedChainState,
  selectedDisplayChainState,
  customLCDState,
  displayChainsState,
  devModeState,
} from "utils/localStorage"

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
    (newChain: string | undefined) => {
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
      const newDisplayChains = {
        ...(displayChains || []),
        [networkName]: newChains,
      }
      setLocalSetting(SettingKey.DisplayChains, newDisplayChains)
      setDisplayChains(newDisplayChains)
    },
    [setDisplayChains, networkName, displayChains]
  )
  return {
    all: displayChains,
    displayChains: displayChains[networkName]?.filter((c) => c !== ""),
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
