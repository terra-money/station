import { useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { atom, useRecoilState } from "recoil"
import { toast } from "react-toastify"
import { getStoredSessions, Connector, Sessions } from "auth/scripts/sessions"
import {
  removeSessions,
  disconnectSession,
  storeSessions,
} from "auth/scripts/sessions"

const sessionsState = atom({
  key: "sessions",
  default: getStoredSessions(),
})

export const useSessionsState = () => {
  const navigate = useNavigate()
  const [sessions, setSessions] = useRecoilState(sessionsState)

  const saveSession = useCallback(
    (connector: Connector) => {
      if (!connector?.peerMeta) {
        return navigate("/wallet", { replace: true })
      }

      const newSessions: Sessions = {
        ...sessions,
        [connector.handshakeTopic]: connector,
      }

      storeSessions(newSessions)
      setSessions(newSessions)
      toast.success("Wallet connected", { toastId: "wallet-connect" })
      return navigate("/wallet", { replace: true })
    },
    [sessions, setSessions, navigate]
  )

  const disconnect = async (key: string) => {
    const sessions = await disconnectSession(key)
    setSessions(sessions)
    toast.success("Wallet disconnected", { toastId: "wallet-disconnect" })
  }

  const disconnectAll = async () => {
    const sessions = await removeSessions()
    setSessions(sessions)
    toast.success("All Wallet disconnected", {
      toastId: "wallet-disconnect",
    })
  }

  return [sessions, disconnect, disconnectAll, saveSession] as const
}
