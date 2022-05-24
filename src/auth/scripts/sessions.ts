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
export type Sessions = Record<string, Connector>

export const getStoredSessions = (): Sessions | undefined => {
  const sessions = localStorage.getItem("sessions")
  if (!sessions) return undefined
  return JSON.parse(sessions)
}

export const storeSessions = (connectors: any) => {
  localStorage.setItem("sessions", JSON.stringify(connectors))
}

export const removeSessions = async () => {
  const res = await WebViewMessage(RN_APIS.DISCONNECT_SESSIONS)
  if (res) {
    localStorage.removeItem("sessions")
  } else {
    throw new Error("Failed remove sessions")
  }
}

export const disconnectSession = async (key: string) => {
  const res = await WebViewMessage(RN_APIS.DISCONNECT_SESSIONS, key)
  if (res) {
    let storedSessions = getStoredSessions()
    delete storedSessions?.[key]
    localStorage.setItem("sessions", JSON.stringify(storedSessions))
    return res
  } else {
    throw new Error("Failed disconnect session")
  }
}

export const connectorsState = atom<Sessions>({
  key: "connectors",
  default: {} as any,
  dangerouslyAllowMutability: true,
})
