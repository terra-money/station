import { Keys, RelayDict } from "types/nostr"
import { DEFAULT_RELAYS } from "utils/nostr"

const getItem = async (key: string): Promise<any | null> => {
  let valueRaw: null | string = localStorage.getItem(key)

  if (valueRaw !== null) {
    try {
      return JSON.parse(valueRaw)
    } catch (e) {
      console.error(
        "ERROR: Failed to parse local storage value for key: " + key
      )
    }
  }

  return null
}

const setItem = async (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value))
}

const removeItem = async (key: string) => {
  localStorage.removeItem(key)
}

export const getKeys = async (): Promise<Keys> => getItem("keys")
export const storeKeys = async (keys: Keys): Promise<void> =>
  setItem("keys", keys)
export const removeKeys = async (): Promise<void> => removeItem("keys")
export const getRelays = (): Promise<RelayDict> =>
  getItem("relays").then((r) => r || DEFAULT_RELAYS)
export const getRelaysNullable = (): Promise<RelayDict | null> =>
  getItem("relays")
export const storeRelays = async (relays: RelayDict) =>
  setItem("relays", relays)
export const removeRelays = async (): Promise<void> => removeItem("relays")

// Skipping using capacitor secure plugin for storing editor history and putting function here to have a clear structure for local storage.
export const getEditorValue = (key: string) => localStorage.getItem(key)
export const storeEditorValue = (key: string, value: string) =>
  localStorage.setItem(key, value)
export const removeEditorValue = (key: string) => localStorage.removeItem(key)
