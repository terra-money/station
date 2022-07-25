import { SendPayload } from "../types/components"

export const toBase64 = (object: object) => {
  try {
    return Buffer.from(JSON.stringify(object)).toString("base64")
  } catch (error) {
    return ""
  }
}

export const fromBase64 = (value: string): string => {
  try {
    return Buffer.from(value, "base64").toString()
  } catch (error) {
    return ""
  }
}

export const parseJSON = (query: string) => {
  try {
    return JSON.parse(query)
  } catch {
    return
  }
}

const tryNewURL = (str: string): URL | undefined => {
  try {
    return new URL(str)
  } catch {}
}

export const parseDynamicLinkURL = (value: string): URL | undefined => {
  const url = tryNewURL(value)
  const link = url?.searchParams.get("link")
  if (link) {
    return tryNewURL(link)
  }
}
export const validateMsg = (msg: string): object | undefined => {
  const parsed = parseJSON(msg)
  if (!parsed) return
  return parsed
}

export type WalletConnectPayloadType = {
  uri: string
}

export type WalletConnectConfirmPayloadType = {
  handshakeTopic: string
  id: number
  params: TxParam
}

export type PayloadType =
  | WalletConnectPayloadType
  | WalletConnectConfirmPayloadType
  | SendPayload

export type TxParam = {
  msgs: string[]
  fee: string | undefined
  memo: string | undefined
  gasPrices: string | undefined
  gasAdjustment: string | undefined
  account_number: number | undefined
  sequence: number | undefined
  feeDenoms: string[] | undefined
}

type ValidationResultType<P> =
  | {
      success: true
      params: P
    }
  | {
      success: false
      errorMessage: string
    }

export const jsonTryParse = <T>(value: string): T | undefined => {
  try {
    return JSON.parse(value) as T
  } catch {
    return undefined
  }
}

export type RootStackParams = {
  WalletConnect: { payload?: string; uri?: string }
  WalletConnectConfirm: {
    handshakeTopic: string
    id: number
    params: TxParam
  }
}

const DEFAULT_ERROR_MESSAGE = "payload is invalid or empty"

export const parsePayload = <T extends PayloadType>(
  value: string
): T | undefined => jsonTryParse<T>(fromBase64(value))

export const validWalletConnectPayload = async (
  payload: string
): Promise<ValidationResultType<RootStackParams["WalletConnect"]>> => {
  const params = parsePayload<WalletConnectPayloadType>(payload)

  let errorMessage = ""

  if (params) {
    const required = ["uri"]

    required.forEach((key) => {
      if (!params.hasOwnProperty(key)) {
        errorMessage = `"${key}" parameter required`
      }
    })

    if (errorMessage) {
      return { success: false, errorMessage }
    }

    return { success: true, params }
  }

  return {
    success: false,
    errorMessage: DEFAULT_ERROR_MESSAGE,
  }
}

export const validWalletConnectConfirmPayload = async (
  payload: string
): Promise<ValidationResultType<RootStackParams["WalletConnectConfirm"]>> => {
  const params = parsePayload<WalletConnectConfirmPayloadType>(payload)

  let errorMessage = ""

  if (params) {
    const required = ["handshakeTopic", "id", "params"]

    required.forEach((key) => {
      if (!params.hasOwnProperty(key)) {
        errorMessage = `"${key}" parameter required`
      }
    })

    if (errorMessage) {
      return { success: false, errorMessage }
    }

    return { success: true, params }
  }

  return {
    success: false,
    errorMessage: DEFAULT_ERROR_MESSAGE,
  }
}
