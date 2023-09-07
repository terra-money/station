import { RefetchOptions } from "data/query"
import { useQuery } from "react-query"
import styles from "./UpdateNotification.module.scss"
import { useTranslation } from "react-i18next"
import axios from "axios"
import { useEffect, useRef, useState } from "react"

const useCommithash = (disabled: boolean) => {
  return useQuery(
    [],
    async () => {
      // fetch commit_hash file created at build time
      const { data: commit_hash } = await axios.get("/commit_hash")
      return commit_hash
    },
    { ...RefetchOptions.DEFAULT, enabled: !disabled }
  )
}

export default function UpdateNotification() {
  const old_commit_hash = useRef<string>()
  const { t } = useTranslation()
  const [showNotification, setShownotification] = useState<boolean>(false)
  const { data: commit_hash } = useCommithash(showNotification)

  useEffect(() => {
    if (showNotification) return
    if (!old_commit_hash.current) old_commit_hash.current = commit_hash

    setShownotification(old_commit_hash.current !== commit_hash)
  }, [commit_hash, showNotification])

  // no update available or request still in progress
  // (comment out next line to test)
  if (!showNotification) return null

  // update available
  return (
    <div className={styles.notification}>
      {t("There is a new version available")}
      <button onClick={() => window.location.reload()}>{t("Reload")}</button>
    </div>
  )
}
