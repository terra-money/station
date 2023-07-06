import { atom, useRecoilState } from "recoil"
import { CustomNetwork } from "types/network"
import { getLocalSetting, setLocalSetting } from "utils/localStorage"
import { SettingKey } from "utils/localStorage"

const customNetworksState = atom({
  key: "customNetworks",
  default: getLocalSetting<CustomNetwork[]>(SettingKey.CustomNetworks),
})

export const useCustomNetworks = () => {
  const [customNetworks, setCustomNetworks] =
    useRecoilState(customNetworksState)

  const validateName = (name: string) => {
    return (
      !["mainnet", "classic", "testnet", "localterra"].includes(name) &&
      !customNetworks.some((network) => network.name === name)
    )
  }

  const updateList = (list: CustomNetwork[]) => {
    setCustomNetworks(list)
    setLocalSetting(SettingKey.CustomNetworks, list)
  }

  const add = (newNetwork: CustomNetwork) => {
    if (!validateName(newNetwork.name))
      throw new Error(`Already exists: ${newNetwork.name}`)

    updateList([...customNetworks, newNetwork])
  }

  const remove = (name: string) =>
    updateList(customNetworks.filter((item) => item.name !== name))

  return { list: customNetworks, add, remove, validateName }
}
