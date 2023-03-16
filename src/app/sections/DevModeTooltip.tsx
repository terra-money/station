import { useTranslation } from "react-i18next"

const DevModeTooltip = () => {
  const { t } = useTranslation()

  return (
    <article>
      <h1>{t("Developer mode enables the following")}:</h1>
      <ul>
        <li>{t("Contracts page")}</li>
        <li>{t("Copy oken addresses from your wallet")}</li>
      </ul>
    </article>
  )
}

export default DevModeTooltip
