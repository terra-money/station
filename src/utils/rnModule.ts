import { toast } from "react-toastify"

import { CreateTxOptions, Fee, Msg } from "@terra-money/terra.js"
import { getStoredSessions } from "../auth/scripts/sessions"
import is from "../auth/scripts/is"

export const RN_APIS = {
  APP_VERSION: "APP_VERSION",
  MIGRATE_KEYSTORE: "MIGRATE_KEYSTORE",
  SET_THEME: "SET_THEME",
  SET_NETWORK: "SET_NETWORK",
  AUTH_BIO: "AUTH_BIO",
  CHECK_BIO: "CHECK_BIO",
  DEEPLINK: "DEEPLINK",
  QR_SCAN: "QR_SCAN",
  RECOVER_SESSIONS: "RECOVER_SESSIONS",
  DISCONNECT_SESSIONS: "DISCONNECT_SESSIONS",
  REJECT_SESSION: "REJECT_SESSION",
  READY_CONNECT_WALLET: "READY_CONNECT_WALLET",
  CONNECT_WALLET: "CONNECT_WALLET",
  CONFIRM_TX: "CONFIRM_TX",
  APPROVE_TX: "APPROVE_TX",
  REJECT_TX: "REJECT_TX",
  GET_LEDGER_LIST: "GET_LEDGER_LIST",
  GET_LEDGER_KEY: "GET_LEDGER_KEY",
} as const

export enum ConfirmErrorCode {
  userDenied = 1, // User Denied
  createTxFailed = 2, // CreateTxFailed (no Txhash)
  txFailed = 3, // TxFailed (Broadcast with Txhash with fail)
  timeOut = 4, // Timeout
  etc = 99,
}

export type RN_API = typeof RN_APIS[keyof typeof RN_APIS] // type

export const schemeUrl = {
  recoverWallet: /^terrastation:(|\/\/)wallet_recover\/\?payload=/,
  send: /^terrastation:(|\/\/)send\/\?payload=/,
}
// 요청 타입
type RN_API_REQ_TYPES = {
  [RN_APIS.APP_VERSION]: unknown
  [RN_APIS.MIGRATE_KEYSTORE]: unknown
  [RN_APIS.SET_THEME]: unknown
  [RN_APIS.SET_NETWORK]: unknown
  [RN_APIS.AUTH_BIO]: unknown
  [RN_APIS.CHECK_BIO]: unknown
  [RN_APIS.DEEPLINK]: unknown
  [RN_APIS.QR_SCAN]: unknown
  [RN_APIS.RECOVER_SESSIONS]: unknown
  [RN_APIS.DISCONNECT_SESSIONS]: unknown
  [RN_APIS.REJECT_SESSION]: unknown
  [RN_APIS.READY_CONNECT_WALLET]: unknown
  [RN_APIS.CONNECT_WALLET]: unknown
  [RN_APIS.CONFIRM_TX]: unknown
  [RN_APIS.APPROVE_TX]: unknown
  [RN_APIS.REJECT_TX]: unknown
  [RN_APIS.GET_LEDGER_LIST]: unknown
  [RN_APIS.GET_LEDGER_KEY]: unknown
}

// 응답 타입
// type RN_API_RES_TYPES = {
//   [RN_APIS.APP_VERSION]: string
//   [RN_APIS.MIGRATE_KEYSTORE]: string
//   [RN_APIS.SET_THEME]: string
//   [RN_APIS.SET_NETWORK]: string
//   [RN_APIS.AUTH_BIO]: string
//   [RN_APIS.CHECK_BIO]: string
//   [RN_APIS.DEEPLINK]: string
//   [RN_APIS.QR_SCAN]: string
//   [RN_APIS.RECOVER_SESSIONS]: string
//   [RN_APIS.DISCONNECT_SESSIONS]: string
//   [RN_APIS.REJECT_SESSION]: string
//   [RN_APIS.READY_CONNECT_WALLET]: string
//   [RN_APIS.CONNECT_WALLET]: string
//   [RN_APIS.CONFIRM_TX]: string
//   [RN_APIS.APPROVE_TX]: string
//   [RN_APIS.REJECT_TX]: string
//   [RN_APIS.GET_LEDGER_LIST]: string
//   [RN_APIS.GET_LEDGER_KEY]: string
// }

/* primitive */
export interface PrimitiveDefaultRequest {
  id: number
  origin: string
}

export interface PrimitiveTxRequest
  extends Partial<TxResponse>,
    PrimitiveDefaultRequest {
  msgs: string[]
  fee?: string
  memo?: string
}

export interface DefaultRequest extends PrimitiveDefaultRequest {
  timestamp?: Date
}

export type RequestType = "sign" | "post" | "signBytes"

export interface TxRequest extends DefaultRequest {
  tx: CreateTxOptions
  handshakeTopic?: string
  // requestType: "sign" | "post"
}

export interface TxResponse<T = any> {
  success: boolean
  result?: T
  error?: { code: number; message?: string }
}

/* helpers */
export const getIsNativeMsgFromExternal = (origin: string) => {
  return (msg: Msg) => {
    if (origin.includes("https://station.terra.money")) return false
    return msg.toData()["@type"] !== "/terra.wasm.v1beta1.MsgExecuteContract"
  }
}

export const parseDefault = (
  request: PrimitiveDefaultRequest
): DefaultRequest => {
  return { ...request, timestamp: new Date(request.id) }
}

export const parseTx = (
  request: PrimitiveTxRequest,
  isClassic: boolean
): TxRequest["tx"] => {
  const { msgs, fee, memo } = request
  const isProto = "@type" in JSON.parse(msgs[0])
  return isProto
    ? {
        msgs: msgs.map((msg) => Msg.fromData(JSON.parse(msg), isClassic)),
        fee: fee ? Fee.fromData(JSON.parse(fee)) : undefined,
        memo,
      }
    : {
        msgs: msgs.map((msg) => Msg.fromAmino(JSON.parse(msg), isClassic)),
        fee: fee ? Fee.fromAmino(JSON.parse(fee)) : undefined,
        memo,
      }
}
export const getVersion = async () => {
  const version = await WebViewMessage(RN_APIS.APP_VERSION)
  return version
}

export const getWallets = async () => {
  const wallets = await WebViewMessage(RN_APIS.MIGRATE_KEYSTORE)
  return wallets
}

export const recoverSessions = async () => {
  const sessions = getStoredSessions()
  const result = await WebViewMessage(RN_APIS.RECOVER_SESSIONS, sessions)
  return result
}

export const WebViewMessage = async <T extends RN_API>(
  type: RN_API,
  data?: RN_API_REQ_TYPES[T]
): Promise<unknown> =>
  new Promise((resolve, reject) => {
    if (!is.mobileNative()) {
      reject("There is no ReactNativeWebView")
      return
    }

    const reqId = Date.now()
    // const TIMEOUT = 100000
    //
    // const timer = setTimeout(() => {
    //   /** android */
    //   document.removeEventListener("message", listener)
    //   /** ios */
    //   window.removeEventListener("message", listener)
    //   reject("TIMEOUT")
    // }, TIMEOUT)

    const listener = (event: any) => {
      if (event?.data.includes("setImmediate$0")) return

      if (event?.data) {
        const { data: listenerData, reqId: listenerReqId } = JSON.parse(
          event.data
        )

        // @ts-ignore
        if (
          typeof listenerData === "string" &&
          listenerData?.includes("Error")
        ) {
          toast.error(listenerData, { toastId: "rn-error" })
        }

        if (listenerReqId === reqId) {
          // clearTimeout(timer)
          /** android */
          document.removeEventListener("message", listener)
          /** ios */
          window.removeEventListener("message", listener)

          resolve(listenerData)
        }
      }
    }
    window.ReactNativeWebView.postMessage(
      JSON.stringify({
        type,
        data,
        reqId,
      })
    )
    /** android */
    document.addEventListener("message", listener)
    /** ios */
    window.addEventListener("message", listener)
  })
