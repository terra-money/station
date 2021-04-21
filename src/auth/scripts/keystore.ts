import encrypt from "./encrypt"
import decrypt from "./decrypt"

/* wallet */
export const getWallet = () => {
  const settings = JSON.parse(localStorage.getItem("settings") ?? "{}")
  return settings.user as Wallet | undefined
}

export const storeWallet = (user: Wallet) => {
  localStorage.setItem("settings", JSON.stringify({ user }))
}

export const clearWallet = () => {
  localStorage.removeItem("settings")
}

/* stored wallets */
export const getStoredWallets = () => {
  const keys = localStorage.getItem("keys") ?? "[]"
  return JSON.parse(keys) as (StoredWallet | StoredWalletLegacy)[]
}

const storeWallets = (wallets: (StoredWallet | StoredWalletLegacy)[]) => {
  localStorage.setItem("keys", JSON.stringify(wallets))
}

/* stored wallet */
export const getStoredWallet = (name: string) => {
  const wallets = getStoredWallets()
  const wallet = wallets.find((wallet) => wallet.name === name)
  if (!wallet) throw new Error("Wallet does not exist")
  return wallet
}

interface Params {
  name: string
  password: string
}

export const getDecryptedKey = ({ name, password }: Params) => {
  const wallet = getStoredWallet(name)

  if ("encrypted" in wallet) return decrypt(wallet.encrypted, password)

  // legacy
  const { privateKey: key } = JSON.parse(decrypt(wallet.wallet, password))
  return key as string
}

export class PasswordError extends Error {}
export const testPassword = (params: Params) => {
  if (!getDecryptedKey(params)) throw new PasswordError("Incorrect password")
  return true
}

interface AddWalletParams extends Params, Wallet {
  key: Buffer
}

export const addWallet = (params: AddWalletParams) => {
  const { name, password, address, key } = params
  const wallets = getStoredWallets()
  if (wallets.find((wallet) => wallet.name === name))
    throw new Error("Wallet already exists")
  const encrypted = encrypt(key.toString("hex"), password)
  const next = wallets.filter((wallet) => wallet.address !== address)
  storeWallets([...next, { name, address, encrypted }])
}

interface ChangePasswordParams {
  name: string
  oldPassword: string
  newPassword: string
}

export const changePassword = (params: ChangePasswordParams) => {
  const { name, oldPassword, newPassword } = params
  testPassword({ name, password: oldPassword })
  const key = getDecryptedKey({ name, password: oldPassword })
  const encrypted = encrypt(key, newPassword)
  const wallets = getStoredWallets()
  const next = wallets.map((wallet) => {
    if (wallet.name === name) {
      const { address } = wallet
      return { name, address, encrypted }
    }

    return wallet
  })

  storeWallets(next)
}

export const deleteWallet = (params: Params) => {
  testPassword(params)
  const wallets = getStoredWallets()
  const next = wallets.filter((wallet) => wallet.name !== params.name)
  storeWallets(next)
}
