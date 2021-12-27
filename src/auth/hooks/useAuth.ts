import { useCallback, useMemo } from "react"
import { atom, useRecoilState } from "recoil"
import { encode } from "js-base64"
import { AccAddress, CreateTxOptions } from "@terra-money/terra.js"
import { PublicKey, RawKey, SignatureV2 } from "@terra-money/terra.js"
import { useChainID } from "data/wallet"
import { useLCDClient } from "data/Terra/lcdClient"
import { PasswordError } from "../scripts/keystore"
import { getDecryptedKey, testPassword } from "../scripts/keystore"
import { getWallet, storeWallet, clearWallet } from "../scripts/keystore"
import { getStoredWallet, getStoredWallets } from "../scripts/keystore"
import encrypt from "../scripts/encrypt"
import * as ledger from "../ledger/ledger"
import LedgerKey from "../ledger/LedgerKey"
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

  const connectLedger = useCallback(
    (address: AccAddress) => {
      const wallet = { address, ledger: true as const }
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
  const connectedWallet = useMemo(() => {
    if (!(wallet && "name" in wallet)) return
    return wallet
  }, [wallet])

  const getConnectedWallet = () => {
    if (!connectedWallet) throw new Error("Wallet is not defined")
    return connectedWallet
  }

  const getKey = (password: string) => {
    const { name } = getConnectedWallet()
    return getDecryptedKey({ name, password })
  }

  const getLedgerKey = async () => {
    const pk = await ledger.getPubKey()
    if (!pk) throw new Error("Public key is not defined")

    const publicKey = PublicKey.fromAmino({
      type: "tendermint/PubKeySecp256k1",
      value: pk.toString("base64"),
    })

    const key = new LedgerKey(publicKey)
    return key
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
  const chainID = useChainID()
  const post = async (txOptions: CreateTxOptions, password = "") => {
    if (!wallet) throw new Error("Wallet is not defined")
    const { address } = wallet

    if ("ledger" in wallet) {
      const key = await getLedgerKey()
      const wallet = lcd.wallet(key)
      const { account_number: accountNumber, sequence } =
        await wallet.accountNumberAndSequence()
      const signMode = SignatureV2.SignMode.SIGN_MODE_LEGACY_AMINO_JSON
      const unsignedTx = await lcd.tx.create([{ address }], txOptions)
      const options = { chainID, accountNumber, sequence, signMode }
      const signedTx = await key.signTx(unsignedTx, options)
      return { result: await lcd.tx.broadcastSync(signedTx) }
    } else {
      const pk = getKey(password)
      if (!pk) throw new PasswordError("Incorrect password")
      const key = new RawKey(Buffer.from(pk, "hex"))
      const wallet = lcd.wallet(key)
      const signedTx = await wallet.createAndSignTx(txOptions)
      return { result: await lcd.tx.broadcastSync(signedTx) }
    }
  }

  return {
    wallet,
    wallets,
    getConnectedWallet,
    connectedWallet,
    connect,
    connectLedger,
    disconnect,
    available,
    encodeEncryptedWallet,
    validatePassword,
    post,
  }
}

export default useAuth
