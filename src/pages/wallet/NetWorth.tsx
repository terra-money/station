import { Button } from "components/general"
import { useCurrency } from "data/settings/Currency"
import { useTranslation } from "react-i18next"
import styles from "./NetWorth.module.scss"

const NetWorth = () => {
  const { t } = useTranslation()
  const currency = useCurrency()

  return (
    <article className={styles.networth}>
      <p>Net Worth</p>
      <h1>{currency.unit} 12,345.67</h1>
      <p>{currency.unit} 1,234.56 available</p>
      <div className={styles.networth__buttons}>
        <Button color="primary">{t("Buy")}</Button>
        <Button>{t("Deposit")}</Button>
        <Button>{t("Send")}</Button>
      </div>
    </article>
  )
}

export default NetWorth
