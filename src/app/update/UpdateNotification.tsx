import { RefetchOptions } from "data/query"
import { useQuery } from "react-query"
import styles from "./UpdateNotification.module.scss"
import { useTranslation } from "react-i18next"
import axios from "axios"

const useIsUpdateAvailable = () => {
  return useQuery(
    [],
    async () => {
      // fetch commit_hash file created at build time
      const { data: commit_hash } = await axios.get("/commit_hash")
      // compare the latest commit_hash (just fetched) with the current commit_hash
      // if they are different there is an update available
      console.log("fetched:" + commit_hash)
      console.log("current:" + process.env.CF_PAGES_COMMIT_SHA)
      return commit_hash !== process.env.CF_PAGES_COMMIT_SHA
    },
    { ...RefetchOptions.DEFAULT }
  )
}

export default function UpdateNotification() {
  const { t } = useTranslation()
  const { data } = useIsUpdateAvailable()

  // no update available or request still in progress
  // (comment out next line to test)
  if (!data) return null

  // update available
  return (
    <div className={styles.notification}>
      {t("There is a new version available")}
      <button onClick={() => window.location.reload()}>{t("Reload")}</button>
    </div>
  )
}
