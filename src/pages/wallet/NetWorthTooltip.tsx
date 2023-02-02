import { useTranslation } from "react-i18next"

const NetWorthTooltip = () => {
  const { t } = useTranslation()

  return (
    <article>
      <p>
        {t(
          "Your portfolio value is the total of all token values in your assets, excluding any delegated tokens"
        )}
        .
      </p>
    </article>
  )
}

export default NetWorthTooltip
