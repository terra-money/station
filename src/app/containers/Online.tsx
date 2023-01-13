import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import WifiOffIcon from "@mui/icons-material/WifiOff"
import Overlay from "../components/Overlay"
import styles from "./Online.module.scss"
import { useNetworkName } from "data/wallet"

const Online = () => {
  const { t } = useTranslation()
  const online = useOnlineStatus()
  const networkName = useNetworkName()

  if (online || networkName === "localterra") return null
  return (
    <Overlay>
      <article>
        <WifiOffIcon style={{ fontSize: 56 }} />
        <h1 className={styles.title}>{t("No internet connection")}</h1>
        <p>{t("Check the internet connection and retry")}</p>
      </article>
    </Overlay>
  )
}

export default Online

/* hooks */
const getOnlineStatus = () => {
  return typeof navigator !== "undefined" &&
    typeof navigator.onLine === "boolean"
    ? navigator.onLine
    : true
}

const useOnlineStatus = () => {
  const [onlineStatus, setOnlineStatus] = useState(getOnlineStatus())

  const goOnline = () => setOnlineStatus(true)
  const goOffline = () => setOnlineStatus(false)

  useEffect(() => {
    window.addEventListener("online", goOnline)
    window.addEventListener("offline", goOffline)

    return () => {
      window.removeEventListener("online", goOnline)
      window.removeEventListener("offline", goOffline)
    }
  }, [])

  return onlineStatus
}
