import { atom } from "recoil"
import { RN_APIS, WebViewMessage } from "../../utils/rnModule"

export type PeerMeta = {
  name: string
  url?: string
  icons?: string[]
}
export type Connector = {
  accounts: string[]
  bridge: string
  chainId: string
  clientId: string
  clientMeta: {
    description: string
    url: string
    icons: string[]
    name: string
  }
  connected: boolean
  handshakeId: number
  handshakeTopic: string
  key: string
  peerId: string
  peerMeta: PeerMeta
}
export type Sessions = Record<string, Connector> | undefined

export const getStoredSessions = (): Sessions => {
  const sessions = localStorage.getItem("sessions")
  if (!sessions || sessions === "undefined") return undefined
  return JSON.parse(sessions) as Sessions
}

export const storeSessions = (connectors: any) => {
  localStorage.setItem("sessions", JSON.stringify(connectors))
  return getStoredSessions()
}

export const removeSessions = async (): Promise<Sessions> => {
  const res = await WebViewMessage(RN_APIS.DISCONNECT_SESSIONS)
  if (res) {
    localStorage.removeItem("sessions")
    return getStoredSessions()
  } else {
    throw new Error("Failed remove sessions")
  }
}

export const disconnectSession = async (key: string): Promise<Sessions> => {
  const res = await WebViewMessage(RN_APIS.DISCONNECT_SESSIONS, key)
  if (res) {
    let storedSessions = getStoredSessions()
    delete storedSessions?.[key]
    localStorage.setItem("sessions", JSON.stringify(storedSessions))
    return getStoredSessions()
  } else {
    throw new Error("Failed disconnect session")
  }
}

export const connectorsState = atom<Sessions>({
  key: "connectors",
  default: {} as any,
  dangerouslyAllowMutability: true,
})
