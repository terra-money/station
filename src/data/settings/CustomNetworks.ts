import { atom, useRecoilState } from "recoil"
import { fromPairs } from "ramda"
import { getLocalSetting, setLocalSetting } from "utils/localStorage"
import { SettingKey } from "utils/localStorage"
import { useNetworks } from "app/NetworksProvider"

const customNetworksState = atom({
  key: "customNetworks",
  default: getLocalSetting<TerraNetwork[]>(SettingKey.CustomNetworks),
})

export const useCustomNetworks = () => {
  const [customNetworks, setCustomNetworks] =
    useRecoilState(customNetworksState)

  const validateName = (name: string) =>
    !customNetworks.some((network) => network.name === name)

  const updateList = (list: TerraNetwork[]) => {
    setCustomNetworks(list)
    setLocalSetting(SettingKey.CustomNetworks, list)
  }

  const add = (newNetwork: TerraNetwork) => {
    if (!validateName(newNetwork.name))
      throw new Error(`Already exists: ${newNetwork.name}`)

    updateList([...customNetworks, newNetwork])
  }

  const remove = (name: string) =>
    updateList(customNetworks.filter((item) => item.name !== name))

  return { list: customNetworks, add, remove, validateName }
}

export const useMergeNetworks = () => {
  const networks = useNetworks()
  const { list } = useCustomNetworks()
  const custom = fromPairs(list.map((item) => [item.name, item]))
  return { ...networks, ...custom }
}
