import { getStoredWallet } from "./keystore"
import wordlist from "./wordlist.json"

const validate = {
  name: {
    alphanumeric: (name: string) =>
      /^[a-z0-9-_]+$/.test(name) || "Enter lowercase alphanumeric characters",
    length: (name: string) =>
      (name.length >= 3 && name.length <= 20) ||
      "Enter 3-20 lowercase alphanumeric characters",
    exists: (name: string) => {
      try {
        const { address } = getStoredWallet(name)
        return `Already exists: ${address}`
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
