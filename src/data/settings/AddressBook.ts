import { atom, useRecoilState } from "recoil"
import { getLocalSetting, setLocalSetting } from "utils/localStorage"
import { SettingKey } from "utils/localStorage"

const addressBookListState = atom({
  key: "addressBookList",
  default: getLocalSetting<AddressBook[]>(SettingKey.AddressBook),
})

export const useAddressBook = () => {
  const [list, setList] = useRecoilState(addressBookListState)

  const validateName = (name: string) =>
    !list.some((item) => item.name === name)

  const updateList = (list: AddressBook[]) => {
    setList(list)
    setLocalSetting(SettingKey.AddressBook, list)
  }

  const add = (newItem: AddressBook) => {
    const name = newItem.name.trim()
    if (!validateName(name)) throw new Error("Already exists")
    updateList([...list, { ...newItem, name }])
  }

  const remove = (name: string) => {
    updateList(list.filter((item) => item.name !== name))
  }

  return { list, add, remove, validateName }
}
