import { useCallback } from "react"
import { atom, useRecoilState } from "recoil"
import { encode } from "js-base64"
import { CreateTxOptions, RawKey } from "@terra-money/terra.js"
import { useLCDClient } from "data/Terra/lcdClient"
import { PasswordError } from "../scripts/keystore"
import { getDecryptedKey, testPassword } from "../scripts/keystore"
import { getWallet, storeWallet, clearWallet } from "../scripts/keystore"
import { getStoredWallet, getStoredWallets } from "../scripts/keystore"
import encrypt from "../scripts/encrypt"
import useAvailable from "./useAvailable"

const walletState = atom({
  key: "wallet",
  default: getWallet(),
})

const useAuth = () => {
  const lcd = useLCDClient()
  const available = useAvailable()

  const [wallet, setWallet] = useRecoilState(walletState)
  const wallets = getStoredWallets()

  /* connect | disconnect */
  const connect = useCallback(
    (name: string) => {
      const { address } = getStoredWallet(name)
      const wallet = { name, address }
      storeWallet(wallet)
      setWallet(wallet)
    },
    [setWallet]
  )

  const disconnect = useCallback(() => {
    clearWallet()
    setWallet(undefined)
  }, [setWallet])

  /* helpers */
  const getConnectedWallet = () => {
    if (!wallet) throw new Error("Wallet is not connected")
    return wallet
  }

  const getKey = (password: string) => {
    const { name } = getConnectedWallet()
    return getDecryptedKey({ name, password })
  }

  /* manage: export */
  const encodeEncryptedWallet = (password: string) => {
    const { name, address } = getConnectedWallet()
    const key = getKey(password)
    const data = { name, address, encrypted_key: encrypt(key, password) }
    return encode(JSON.stringify(data))
  }

  /* form */
  const validatePassword = (password: string) => {
    try {
      const { name } = getConnectedWallet()
      return testPassword({ name, password })
    } catch (error) {
      return "Incorrect password"
    }
  }

  /* tx */
  const post = async (txOptions: CreateTxOptions, password: string) => {
    const pk = getKey(password)
    if (!pk) throw new PasswordError("Incorrect password")
    const rk = new RawKey(Buffer.from(pk, "hex"))
    const wallet = lcd.wallet(rk)
    const signedTx = await wallet.createAndSignTx(txOptions)
    return { result: await lcd.tx.broadcastSync(signedTx) }
  }

  return {
    wallet,
    wallets,
    connect,
    disconnect,
    available,
    encodeEncryptedWallet,
    validatePassword,
    post,
  }
}

export default useAuth
