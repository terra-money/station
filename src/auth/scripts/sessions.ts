import { atom } from "recoil"

export const getStoredSessions = () => {
  const sessions = localStorage.getItem("sessions") ?? "{}"
  return JSON.parse(sessions) as any
}

export const storeSessions = (connector: any) => {
  localStorage.setItem("sessions", JSON.stringify(connector))
}

export const connectorsState = atom<Record<string, any>>({
  key: "connectors",
  default: {} as any,
  dangerouslyAllowMutability: true,
})
