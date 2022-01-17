import is from "./is"
import encrypt from "./encrypt"
import decrypt from "./decrypt"

/* wallet */
export const getWallet = () => {
  const user = localStorage.getItem("user")
  if (!user) return
  return JSON.parse(user) as Wallet
}

export const storeWallet = (user: Wallet) => {
  localStorage.setItem("user", JSON.stringify(user))
}

export const clearWallet = () => {
  localStorage.removeItem("user")
}

/* stored wallets */
type StoredKey = StoredWallet | StoredWalletLegacy | MultisigWallet
export const getStoredWallets = () => {
  const keys = localStorage.getItem("keys") ?? "[]"
  return JSON.parse(keys) as StoredKey[]
}

const storeWallets = (wallets: StoredKey[]) => {
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

  try {
    if ("encrypted" in wallet) {
      return decrypt(wallet.encrypted, password)
    } else if ("wallet" in wallet) {
      // legacy
      const { privateKey: key } = JSON.parse(decrypt(wallet.wallet, password))
      return key as string
    } else {
      return ""
    }
  } catch {
    throw new PasswordError("Incorrect password")
  }
}

export class PasswordError extends Error {}
export const testPassword = (params: Params) => {
  if (!getDecryptedKey(params)) throw new PasswordError("Incorrect password")
  return true
}

type AddWalletParams =
  | { name: string; address: string; password: string; key: Buffer }
  | MultisigWallet

export const addWallet = (params: AddWalletParams) => {
  const wallets = getStoredWallets()

  if (wallets.find((wallet) => wallet.name === params.name))
    throw new Error("Wallet already exists")

  const next = wallets.filter((wallet) => wallet.address !== params.address)

  if (is.multisig(params)) {
    storeWallets([...next, params])
  } else {
    const { name, password, address, key } = params
    const encrypted = encrypt(key.toString("hex"), password)
    storeWallets([...next, { name, address, encrypted }])
  }
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

export const deleteWallet = (name: string) => {
  const wallets = getStoredWallets()
  const next = wallets.filter((wallet) => wallet.name !== name)
  storeWallets(next)
}

export const lockWallet = (name: string) => {
  const wallets = getStoredWallets()
  const next = wallets.map((wallet) =>
    wallet.name === name ? { ...wallet, lock: true } : wallet
  )

  storeWallets(next)
}

export const unlockWallet = (name: string, password = "") => {
  const wallets = getStoredWallets()

  testPassword({ name, password })

  const next = wallets.map((wallet) => {
    const { lock, ...rest } = wallet
    return wallet.name === name ? rest : wallet
  })

  storeWallets(next)
}
