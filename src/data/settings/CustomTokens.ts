import { atom, useRecoilState } from "recoil"
import update from "immutability-helper"
import { DefaultCustomTokensItem, SettingKey } from "utils/localStorage"
import { getLocalSetting, setLocalSetting } from "utils/localStorage"
import { useChainID, useNetworkName } from "../wallet"

const customTokensState = atom({
  key: "customTokens",
  default: getLocalSetting<CustomTokens>(SettingKey.CustomTokens),
})

interface Params<T> {
  type: "cw20" | "cw721" | "native"
  key: keyof T
}

const useCustomTokens = <T extends CustomToken>({ type, key }: Params<T>) => {
  const [customTokens, setCustomTokens] = useRecoilState(customTokensState)
  const networkName = useNetworkName()
  const chainID = useChainID()
  const list = (customTokens[networkName]?.[type] ?? []) as T[]

  const getIsAdded = (param: T) =>
    !!list.find((item) => item[key] === param[key])

  const updateList = (list: T[]) => {
    const prev = {
      [networkName]: DefaultCustomTokensItem(chainID),
      ...customTokens,
    }
    const next = update(prev, { [networkName]: { [type]: { $set: list } } })
    setCustomTokens(next)
    setLocalSetting(SettingKey.CustomTokens, next)
  }

  const add = (newItem: T) => {
    if (getIsAdded(newItem)) return
    updateList([...list, newItem])
  }

  const remove = (oldItem: T) =>
    updateList(list.filter((item) => item[key] !== oldItem[key]))

  return { list, getIsAdded, update: updateList, add, remove }
}

export const useCustomTokensCW20 = () => {
  return useCustomTokens<CustomTokenCW20>({ type: "cw20", key: "token" })
}

export const useCustomTokensNative = () => {
  return useCustomTokens<NativeTokenBasicInfo>({ type: "native", key: "id" })
}

export const useCustomTokensCW721 = () => {
  return useCustomTokens<CustomTokenCW721>({ type: "cw721", key: "contract" })
}
