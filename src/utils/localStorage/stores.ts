import { getLocalSetting } from "utils/localStorage"
import { SettingKey } from "utils/localStorage"
import { atom } from "recoil"

export const hideNoWhitelistState = atom({
  key: "hideNoWhitelistState",
  default: !!getLocalSetting(SettingKey.HideNonWhitelistTokens),
})
export const devModeState = atom({
  key: "devModeState",
  default: !!getLocalSetting(SettingKey.DevMode),
})

export const hideLowBalTokenState = atom({
  key: "hideLowBalTokenState",
  default: !!getLocalSetting(SettingKey.HideLowBalTokens),
})

export const savedChainState = atom({
  key: "savedNetwork",
  default: getLocalSetting(SettingKey.Chain) as string | undefined,
})
export const selectedDisplayChainState = atom({
  key: "selectedDisplayChain",
  default: getLocalSetting(SettingKey.SelectedDisplayChain) as
    | string
    | undefined,
})

export const customLCDState = atom({
  key: "customLCD",
  default: getLocalSetting<Record<string, string | undefined>>(
    SettingKey.CustomLCD
  ),
})
export const displayChainsState = atom({
  key: "displayChains",
  default: getLocalSetting(SettingKey.DisplayChains) as Record<
    string,
    string[]
  >,
})
