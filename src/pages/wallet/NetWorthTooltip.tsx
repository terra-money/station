import { useTranslation } from "react-i18next"
import styles from "./NetWorthTooltip.module.scss"

const NetWorthTooltip = () => {
  const { t } = useTranslation()

  return (
    <article>
      <p>{t("Value comes from assets added to your asset list")}.</p>
      <br />

      <p>
        {t("You can add or remove assets by selecting")}
        <span className={styles.manage_tokens}> {t("Manage tokens")} </span>
        {t("in the asset list header below")}.
      </p>
    </article>
  )
}

export default NetWorthTooltip
