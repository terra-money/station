import { getStoredWallet } from "./keystore"
import wordlist from "bip39/src/wordlists/english.json"

const validate = {
  name: {
    alphanumeric: (name: string) =>
      /^[a-zA-Z0-9-_\s]+$/.test(name) ||
      "A name can only contain alphanumeric characters, spaces and those symbols (-, _).",
    length: (name: string) => {
      if (name.length < 3) return "The name must be at least 3 characters long."
      if (name.length > 20)
        return "The name cannot be longer than 20 characters."
      return true
    },
    exists: (name: string) => {
      try {
        getStoredWallet(name)
        return `A wallet with this name already exists.`
      } catch {
        return true
      }
    },
  },

  password: {
    required: (password: string) => !!password.length || "Password is required",
    length: (password: string) =>
      password.length >= 10 || "Password must be longer than 10 characters",
  },

  confirm: (password: string, confirm: string) =>
    password === confirm || "Password does not match",

  mnemonic: {
    length: (mnemonic: string) => {
      const seed = mnemonic.trim().split(" ")
      return seed.length === 12 || seed.length === 24 || "Invalid mnemonic"
    },
    wordlist: (mnemonic: string) => {
      const seed = mnemonic.trim().split(" ")
      const invalid = seed.find((word) => !wordlist.includes(word))
      return !invalid || `${invalid} is invalid`
    },
  },

  index: {
    integer: (index: number) =>
      Number.isInteger(index) || "Index must be an integer",
    range: (index: number) =>
      (index >= 0 && index <= 1e6) || "Index must be between 0 and 1000000",
  },
}

export default validate
