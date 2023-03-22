import { useTranslation } from "react-i18next"

export const DevModeTooltip = () => {
  const { t } = useTranslation()

  return (
    <article>
      <h1>{t("Developer mode enables the following")}:</h1>
      <ul>
        <li>{t("Contracts page")}</li>
        <li>{t("Copy token addresses from your wallet")}</li>
      </ul>
    </article>
  )
}
export const GasAdjustmentTooltip = () => {
  const { t } = useTranslation()
  return (
    <article>
      <p>
        {t(
          "Set a gas adjustment coefficient in case none is specified by the chain"
        )}
      </p>
    </article>
  )
}
