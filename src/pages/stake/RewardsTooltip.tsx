import { useTranslation } from "react-i18next"
import styles from "./RewardsTooltip.module.scss"

const RewardsTooltip = () => {
  const { t } = useTranslation()

  return (
    <article>
      <h1>{t("Staking rewards are withdrawn automatically on")}</h1>

      <ul className={styles.list}>
        <li>{t("Delegation")}</li>
        <li>{t("Redelegation")}</li>
        <li>{t("Undelegation")}</li>
        <li>{t("Mainnet upgrade")}</li>
      </ul>

      <footer>{t("This will not be displayed in transaction history")}</footer>
    </article>
  )
}

export default RewardsTooltip
