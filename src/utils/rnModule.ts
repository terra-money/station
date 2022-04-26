import { CreateTxOptions, Fee, Msg } from "@terra-money/terra.js"
import { getStoredSessions } from "../auth/scripts/sessions"

declare global {
  interface Window {
    ReactNativeWebView: any
  }
}

export const RN_APIS = {
  MIGRATE_KEYSTORE: "MIGRATE_KEYSTORE",
  AUTH_BIO: "AUTH_BIO",
  DEEPLINK: "DEEPLINK",
  QR_SCAN: "QR_SCAN",
  RECOVER_SESSIONS: "RECOVER_SESSIONS",
  DISCONNECT_SESSIONS: "DISCONNECT_SESSIONS",
  READY_CONNECT_WALLET: "READY_CONNECT_WALLET",
  CONNECT_WALLET: "CONNECT_WALLET",
  CONFIRM_TX: "CONFIRM_TX",
  APPROVE_TX: "APPROVE_TX",
  REJECT_TX: "REJECT_TX",
} as const

export type RN_API = typeof RN_APIS[keyof typeof RN_APIS] // type

// 요청 타입
type RN_API_REQ_TYPES = {
  [RN_APIS.MIGRATE_KEYSTORE]: unknown
  [RN_APIS.AUTH_BIO]: unknown
  [RN_APIS.DEEPLINK]: unknown
  [RN_APIS.QR_SCAN]: unknown
  [RN_APIS.RECOVER_SESSIONS]: unknown
  [RN_APIS.DISCONNECT_SESSIONS]: unknown
  [RN_APIS.READY_CONNECT_WALLET]: unknown
  [RN_APIS.CONNECT_WALLET]: unknown
  [RN_APIS.CONFIRM_TX]: unknown
  [RN_APIS.APPROVE_TX]: unknown
  [RN_APIS.REJECT_TX]: unknown
}

// 응답 타입
type RN_API_RES_TYPES = {
  [RN_APIS.MIGRATE_KEYSTORE]: string
  [RN_APIS.AUTH_BIO]: string
  [RN_APIS.DEEPLINK]: string
  [RN_APIS.QR_SCAN]: string
  [RN_APIS.RECOVER_SESSIONS]: string
  [RN_APIS.DISCONNECT_SESSIONS]: string
  [RN_APIS.READY_CONNECT_WALLET]: string
  [RN_APIS.CONNECT_WALLET]: string
  [RN_APIS.CONFIRM_TX]: string
  [RN_APIS.APPROVE_TX]: string
  [RN_APIS.REJECT_TX]: string
}

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
  timestamp: Date
}

export type RequestType = "sign" | "post" | "signBytes"

export interface TxRequest extends DefaultRequest {
  tx: CreateTxOptions
  requestType: "sign" | "post"
}

export interface TxResponse<T = any> {
  success: boolean
  result?: T
  error?: { code: number; message?: string }
}

export const parseTx = (request: PrimitiveTxRequest): TxRequest["tx"] => {
  const { msgs, fee, memo } = request
  const isProto = "@type" in JSON.parse(msgs[0])
  return isProto
    ? {
        msgs: msgs.map((msg) => Msg.fromData(JSON.parse(msg))),
        fee: fee ? Fee.fromData(JSON.parse(fee)) : undefined,
        memo,
      }
    : {
        msgs: msgs.map((msg) => Msg.fromAmino(JSON.parse(msg))),
        fee: fee ? Fee.fromAmino(JSON.parse(fee)) : undefined,
        memo,
      }
}

export const getWallets = async () => {
  const wallets = await WebViewMessage(RN_APIS.MIGRATE_KEYSTORE)
  return wallets
}

export const recoverSessions = async () => {
  const sessions = getStoredSessions()
  console.log("recoverSessions", sessions)
  const result = await WebViewMessage(RN_APIS.RECOVER_SESSIONS, sessions)
  return result
}

export const WebViewMessage = async <T extends RN_API>(
  type: RN_API,
  data?: RN_API_REQ_TYPES[T]
): Promise<RN_API_RES_TYPES[T] | null> =>
  new Promise((resolve, reject) => {
    if (!window.ReactNativeWebView) {
      // alert('ReactNativeWebView 객체가 없습니다.');
      reject("ReactNativeWebView 객체가 없습니다.")
      return
    }

    const reqId = Date.now()
    const TIMEOUT = 10000

    const timer = setTimeout(() => {
      /** android */
      document.removeEventListener("message", listener)
      /** ios */
      window.removeEventListener("message", listener)
      reject("TIMEOUT")
    }, TIMEOUT)

    const listener = (event: any) => {
      if (event.data.includes("setImmediate$0")) return

      const {
        data: listenerData,
        reqId: listenerReqId,
      }: { data: RN_API_RES_TYPES[T]; reqId: typeof reqId } = JSON.parse(
        event.data
      )
      if (listenerReqId === reqId) {
        clearTimeout(timer)
        /** android */
        document.removeEventListener("message", listener)
        /** ios */
        window.removeEventListener("message", listener)
        resolve(listenerData)
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
