import { useCallback, useMemo } from "react"
import { atom, useRecoilState } from "recoil"
import { encode } from "js-base64"
import { CreateTxOptions, Tx, isTxError } from "@terra-money/terra.js"
import { AccAddress, SignDoc } from "@terra-money/terra.js"
import { MnemonicKey, RawKey, SignatureV2 } from "@terra-money/terra.js"
import { LedgerKey } from "@terra-money/ledger-terra-js"
import BluetoothTransport from "@ledgerhq/hw-transport-web-ble"
import { LEDGER_TRANSPORT_TIMEOUT } from "config/constants"
import { useChainID } from "data/wallet"
import { useIsClassic } from "data/query"
import { useLCDClient } from "data/queries/lcdClient"
import is from "../scripts/is"
import {
  addWallet,
  getBioAble,
  getBioStamps,
  PasswordError,
  setBioKeys,
  setBioStamps,
} from "../scripts/keystore"
import { getDecryptedKey, testPassword } from "../scripts/keystore"
import { getWallet, storeWallet } from "../scripts/keystore"
import { clearWallet, lockWallet } from "../scripts/keystore"
import { getStoredWallet, getStoredWallets } from "../scripts/keystore"
import { getBioState, getBioKeys } from "../scripts/keystore"
import encrypt from "../scripts/encrypt"
import useAvailable from "./useAvailable"
import decrypt from "../scripts/decrypt"
import { RN_APIS, WebViewMessage } from "../../utils/rnModule"
import { getStoredSessions, removeSessions } from "../scripts/sessions"
import { SyncTxBroadcastResult } from "@terra-money/terra.js/dist/client/lcd/api/TxAPI"

const walletState = atom({
  key: "wallet",
  default: getWallet(),
})

const isAbleBioState = atom({
  key: "ableBio",
  default: getBioAble(),
})

const isUseBioState = atom({
  key: "bio",
  default: getBioState(),
})

const useAuth = () => {
  const isClassic = useIsClassic()
  const lcd = useLCDClient()
  const available = useAvailable()

  const [wallet, setWallet] = useRecoilState(walletState)
  const [isAbleBio] = useRecoilState(isAbleBioState)
  const [isUseBio, setIsUseBio] = useRecoilState(isUseBioState)
  const wallets = getStoredWallets()
  const connectors = getStoredSessions()

  const initBio = async (address: string) => {
    const keys = getBioKeys()
    const bioKey = keys?.[address]
    if (bioKey) {
      setIsUseBio(true)
    } else {
      setIsUseBio(false)
    }
  }

  /* connect */
  const connect = useCallback(
    async (name: string) => {
      const storedWallet = getStoredWallet(name)
      const { address, lock } = storedWallet

      if (lock) throw new Error("Wallet is locked")

      const wallet = is.multisig(storedWallet)
        ? { name, address, multisig: true }
        : is.ledger(storedWallet)
        ? { name, address, ledger: true, index: storedWallet.index }
        : { name, address }

      storeWallet(wallet)
      setWallet(wallet)

      initBio(address)
      if (connectors) await removeSessions()
    },
    [setWallet]
  )

  const connectPreconfigured = useCallback(
    (wallet: PreconfiguredWallet) => {
      storeWallet(wallet)
      setWallet(wallet)
    },
    [setWallet]
  )

  const connectLedger = useCallback(
    (address: AccAddress, index = 0, bluetooth = true, name = "Ledger") => {
      const wallet = {
        name,
        address,
        ledger: true as const,
        index,
        bluetooth,
      }
      addWallet(wallet)
      storeWallet(wallet)
      setWallet(wallet)
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
  const disconnect = useCallback(async () => {
    clearWallet()
    setWallet(undefined)
    if (isUseBio) disableBioAuth()
    if (connectors) await removeSessions()
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

  const getLedgerKey = async () => {
    if (!is.ledger(wallet)) throw new Error("Ledger device is not connected")
    const { index, bluetooth } = wallet

    const transport = bluetooth
      ? await BluetoothTransport.create(LEDGER_TRANSPORT_TIMEOUT)
      : undefined
    return LedgerKey.create(transport, index)
  }

  /* manage: export */
  const encodeEncryptedWallet = (password: string) => {
    const { name, address } = getConnectedWallet()
    const key = getKey(password)
    const data = { name, address, encrypted_key: encrypt(key, password) }
    return encode(JSON.stringify(data))
  }

  /* manage: bio auth */
  const disableBioAuth = () => {
    const { address } = getConnectedWallet()
    const storedBioKey = getBioKeys()
    const storedTimestamp = getBioStamps()

    delete storedBioKey?.[address]
    delete storedTimestamp?.[address]

    setBioKeys(storedTimestamp)
    setBioStamps(storedBioKey)

    setIsUseBio(false)
    return true
  }

  const encodeBioAuthKey = (password: string) => {
    const { address } = getConnectedWallet()
    const timestamp = Date.now()

    const storedBioKey = getBioKeys()
    const storedTimestamp = getBioStamps()

    setBioKeys({
      ...storedBioKey,
      [address]: encrypt(password, String(timestamp)),
    })
    setBioStamps({
      ...storedTimestamp,
      [address]: String(timestamp),
    })
    setIsUseBio(true)
    return true
  }

  const decodeBioAuthKey = async () => {
    const res = await WebViewMessage(RN_APIS.AUTH_BIO)
    if (res) {
      const { address } = getConnectedWallet()
      const storedBioKey = getBioKeys()?.[address]

      const storedTimestamp = getBioStamps()?.[address]
      const decrypted = decrypt(storedBioKey, storedTimestamp)
      return decrypted
    } else {
      throw new Error("failed bio")
    }
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

  const create = async (txOptions: CreateTxOptions) => {
    if (!wallet) throw new Error("Wallet is not defined")
    const { address } = wallet
    return await lcd.tx.create([{ address }], txOptions)
  }

  const createSignature = async (
    tx: Tx,
    address: AccAddress,
    password = ""
  ) => {
    if (!wallet) throw new Error("Wallet is not defined")

    const accountInfo = await lcd.auth.accountInfo(address)

    const doc = new SignDoc(
      lcd.config.chainID,
      accountInfo.getAccountNumber(),
      accountInfo.getSequenceNumber(),
      tx.auth_info,
      tx.body
    )

    if (is.ledger(wallet)) {
      const key = await getLedgerKey()
      return await key.createSignatureAmino(doc, isClassic)
    } else {
      const pk = getKey(password)
      if (!pk) throw new PasswordError("Incorrect password")
      const key = new RawKey(Buffer.from(pk, "hex"))
      return await key.createSignatureAmino(doc, isClassic)
    }
  }

  const sign = async (txOptions: CreateTxOptions, password = "") => {
    if (!wallet) throw new Error("Wallet is not defined")

    if (is.ledger(wallet)) {
      const key = await getLedgerKey()
      const wallet = lcd.wallet(key)
      const { account_number: accountNumber, sequence } =
        await wallet.accountNumberAndSequence()
      const signMode = SignatureV2.SignMode.SIGN_MODE_LEGACY_AMINO_JSON
      const unsignedTx = await create(txOptions)
      const options = { chainID, accountNumber, sequence, signMode }
      return await key.signTx(unsignedTx, options)
    } else if (is.preconfigured(wallet)) {
      const key = new MnemonicKey({ mnemonic: wallet.mnemonic })
      return await lcd.wallet(key).createAndSignTx(txOptions)
    } else {
      const pk = getKey(password)
      if (!pk) throw new PasswordError("Incorrect password")
      const key = new RawKey(Buffer.from(pk, "hex"))
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
      const key = new RawKey(Buffer.from(pk, "hex"))
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
    if (is.mobileNative() && is.ledger(wallet)) {
      const result = await WebViewMessage(RN_APIS.GET_LEDGER_KEY, {
        id: password,
        path: wallet.index,
        address: wallet.address,
        txOptions,
        lcdConfigs: lcd.config,
      })

      // @ts-ignore
      if (result?.includes("Error")) {
        return result
      } else {
        // @ts-ignore
        return JSON.parse(result) as SyncTxBroadcastResult
      }
    } else {
      const signedTx = await sign(txOptions, password)
      const result = await lcd.tx.broadcastSync(signedTx)
      if (isTxError(result)) throw new Error(result.raw_log)
      return result
    }
  }

  return {
    wallet,
    wallets,
    isAbleBio,
    isUseBio,
    getConnectedWallet,
    getLedgerKey,
    connectedWallet,
    connect,
    connectPreconfigured,
    connectLedger,
    disconnect,
    lock,
    available,
    encodeEncryptedWallet,
    encodeBioAuthKey,
    decodeBioAuthKey,
    disableBioAuth,
    validatePassword,
    createSignature,
    create,
    signBytes,
    sign,
    post,
  }
}

export default useAuth
