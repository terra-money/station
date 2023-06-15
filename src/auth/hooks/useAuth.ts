import { useCallback, useMemo } from "react"
import { atom, useRecoilState } from "recoil"
import { encode } from "js-base64"
import { CreateTxOptions, Tx, isTxError } from "@terra-money/feather.js"
import { AccAddress, SignDoc } from "@terra-money/feather.js"
import { RawKey, SignatureV2 } from "@terra-money/feather.js"
import { LedgerKey } from "@terra-money/ledger-station-js"
import { useInterchainLCDClient } from "data/queries/lcdClient"
import is from "../scripts/is"
import { addWallet, PasswordError } from "../scripts/keystore"
import { getDecryptedKey, testPassword } from "../scripts/keystore"
import { getWallet, storeWallet } from "../scripts/keystore"
import { clearWallet, lockWallet } from "../scripts/keystore"
import { getStoredWallet, getStoredWallets } from "../scripts/keystore"
import encrypt from "../scripts/encrypt"
import useAvailable from "./useAvailable"
import { addressFromWords, wordsFromAddress } from "utils/bech32"
import { useNetwork } from "./useNetwork"
import { createBleTransport } from "utils/ledger"

export const walletState = atom({
  key: "interchain-wallet",
  default: getWallet(),
})

const useAuth = () => {
  const lcd = useInterchainLCDClient()
  const networks = useNetwork()
  const available = useAvailable()

  const [wallet, setWallet] = useRecoilState(walletState)
  const wallets = getStoredWallets()

  /* connect */
  const connect = useCallback(
    (name: string) => {
      const storedWallet = getStoredWallet(name)
      if ("address" in storedWallet) {
        const { address, lock } = storedWallet
        const words = {
          "330": wordsFromAddress(address),
        }

        if (lock) throw new Error("Wallet is locked")

        const wallet = is.multisig(storedWallet)
          ? { name, words, multisig: true as true }
          : { name, words }

        storeWallet(wallet)
        setWallet(wallet as any)
      } else {
        const { lock } = storedWallet
        if (lock) throw new Error("Wallet is locked")

        storeWallet(storedWallet)
        setWallet(storedWallet as any)
      }
    },
    [setWallet]
  )

  const connectLedger = useCallback(
    (
      words: { "330": string; "118"?: string },
      index = 0,
      bluetooth = false,
      name = "Ledger"
    ) => {
      const wallet = {
        words,
        ledger: true as const,
        index,
        bluetooth,
        lock: false as const,
        name,
      }
      addWallet(wallet)
      storeWallet(wallet)
      setWallet(wallet as any)
    },
    [setWallet]
  )

  /* connected */
  const connectedWallet = useMemo(() => {
    if (!is.local(wallet)) return
    return wallet
  }, [wallet])

  const getConnectedWallet = useCallback(() => {
    if (!connectedWallet) throw new Error("Wallet is not defined")
    return connectedWallet
  }, [connectedWallet])

  /* disconnected */
  const disconnect = useCallback(() => {
    clearWallet()
    setWallet(undefined)
  }, [setWallet])

  const lock = useCallback(() => {
    const { name } = getConnectedWallet()
    lockWallet(name)
    disconnect()
  }, [disconnect, getConnectedWallet])

  /* helpers */
  const getKey = (password: string) => {
    const { name } = getConnectedWallet()
    return getDecryptedKey({ name, password })
  }

  const getLedgerKey = async (coinType: string) => {
    if (!is.ledger(wallet)) throw new Error("Ledger device is not connected")
    const { index, bluetooth } = wallet
    const transport = bluetooth ? createBleTransport : undefined

    return LedgerKey.create({ transport, index, coinType: Number(coinType) })
  }

  /* manage: export */
  // TODO: export both 119 and 330 key
  const encodeEncryptedWallet = (password: string) => {
    const { name, words } = getConnectedWallet()
    const key = getKey(password)
    if (!key) throw new PasswordError("Key do not exist")
    const data = {
      name,
      address: addressFromWords(words["330"], "terra"),
      encrypted_key: encrypt(key["330"], password),
    }
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
  const create = async (txOptions: CreateTxOptions) => {
    if (!wallet) throw new Error("Wallet is not defined")
    const { words } = wallet
    const address = addressFromWords(
      words[networks[txOptions?.chainID].coinType] ?? "",
      networks[txOptions?.chainID]?.prefix
    )

    return await lcd.tx.create([{ address }], txOptions)
  }

  const createSignature = async (
    tx: Tx,
    chainID: string,
    address: AccAddress,
    password = ""
  ) => {
    if (!wallet) throw new Error("Wallet is not defined")

    const accountInfo = await lcd.auth.accountInfo(address)
    if (!accountInfo) throw new Error("Couldn't retrieve account info")

    const doc = new SignDoc(
      chainID,
      accountInfo.getAccountNumber(),
      accountInfo.getSequenceNumber(),
      tx.auth_info,
      tx.body
    )

    if (is.ledger(wallet)) {
      const key = await getLedgerKey(networks[chainID].coinType)
      return await key.createSignatureAmino(doc)
    } else {
      const pk = getKey(password)
      if (!pk || !pk[networks[chainID].coinType])
        throw new PasswordError("Incorrect password")
      const key = new RawKey(
        Buffer.from(pk[networks[chainID].coinType] ?? "", "hex")
      )
      return await key.createSignatureAmino(doc)
    }
  }

  const sign = async (txOptions: CreateTxOptions, password = "") => {
    if (!wallet) throw new Error("Wallet is not defined")

    if (is.ledger(wallet)) {
      const key = await getLedgerKey(networks[txOptions?.chainID].coinType)
      const wallet = lcd.wallet(key)
      const signMode = SignatureV2.SignMode.SIGN_MODE_LEGACY_AMINO_JSON
      return await wallet.createAndSignTx({
        ...txOptions,
        signMode,
      })
    } /*else if (is.preconfigured(wallet)) {
      const key = new MnemonicKey({ mnemonic: wallet.mnemonic })
      return await lcd.wallet(key).createAndSignTx(txOptions)
    }*/ else {
      const pk = getKey(password)
      if (!pk || !pk[networks[txOptions?.chainID].coinType])
        throw new PasswordError("Incorrect password")
      const key = new RawKey(
        Buffer.from(pk[networks[txOptions?.chainID].coinType] ?? "", "hex")
      )
      const wallet = lcd.wallet(key)
      return await wallet.createAndSignTx(txOptions)
    }
  }

  const signBytes = (bytes: Buffer, password = "") => {
    if (!wallet) throw new Error("Wallet is not defined")

    if (is.ledger(wallet)) {
      throw new Error("Ledger can not sign arbitrary data")
    } else {
      const pk = getKey(password)
      if (!pk) throw new PasswordError("Incorrect password")
      const key = new RawKey(Buffer.from(pk["330"], "hex"))
      const { signature, recid } = key.ecdsaSign(bytes)
      if (!signature) throw new Error("Signature is undefined")
      return {
        recid,
        signature: Buffer.from(signature).toString("base64"),
        public_key: key.publicKey?.toAmino().value as string,
      }
    }
  }

  const post = async (txOptions: CreateTxOptions, password = "") => {
    if (!wallet) throw new Error("Wallet is not defined")
    const signedTx = await sign(txOptions, password)
    const result = await lcd.tx.broadcastSync(signedTx, txOptions?.chainID)
    if (isTxError(result)) throw new Error(result.raw_log)
    return result
  }

  return {
    wallet,
    wallets,
    getConnectedWallet,
    getLedgerKey,
    connectedWallet,
    connect,
    connectLedger,
    disconnect,
    lock,
    available,
    encodeEncryptedWallet,
    validatePassword,
    createSignature,
    create,
    signBytes,
    sign,
    post,
  }
}

export default useAuth
