import { atom } from "recoil"

export type Sessions = Record<string, any>

export const getStoredSessions = (): Sessions | undefined => {
  const sessions = localStorage.getItem("sessions")
  if (!sessions) return undefined
  return JSON.parse(sessions)
}

export const storeSessions = (connectors: any) => {
  localStorage.setItem("sessions", JSON.stringify(connectors))
}

export const removeSessions = () => {
  localStorage.removeItem("sessions")
}

export const connectorsState = atom<Sessions>({
  key: "connectors",
  default: {} as any,
  dangerouslyAllowMutability: true,
})
