import { useTranslation } from "react-i18next"

const QuickStakeTooltip = () => {
  const { t } = useTranslation()

  return (
    <article>
      <h1>{t("Quick stake selects validators that")}:</h1>
      <ul>
        <li>{t("Are outside of top third by voting power")}</li>
        <li>{t("Charge 5% commission or less")}</li>
        <li>{t("Have not been slashed recently")}</li>
        <li>{t("Are in the active set")}</li>
      </ul>
    </article>
  )
}

export default QuickStakeTooltip
