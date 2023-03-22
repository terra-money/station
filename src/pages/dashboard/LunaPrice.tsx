import { useTranslation } from "react-i18next"
import { useCurrency } from "data/settings/Currency"
import { useExchangeRates } from "data/queries/coingecko"
import { Card } from "components/layout"
import { Read } from "components/token"
import { ModalButton } from "components/feedback"
import LunaPriceChart from "../charts/LunaPriceChart"
import DashboardContent from "./components/DashboardContent"
import styles from "./Dashboard.module.scss"

const LunaPrice = () => {
  const { t } = useTranslation()
  const currency = useCurrency()
  const denom = currency.id === "uluna" ? "uusd" : currency.id
  const { data: prices, ...state } = useExchangeRates()

  const render = () => {
    if (!prices) return
    const { uluna: price } = prices
    return (
      <DashboardContent
        value={<Read amount={String(price.price * 1e6)} denom={denom} auto />}
        footer={
          <ModalButton
            title={t("Luna price")}
            renderButton={(open) => (
              <button onClick={open}>{t("Show chart")}</button>
            )}
          >
            <LunaPriceChart />
          </ModalButton>
        }
      />
    )
  }

  return (
    <Card
      {...state}
      title={t("Luna price")}
      className={styles.price}
      size="small"
    >
      {render()}
    </Card>
  )
}

export default LunaPrice
