import { useTranslation } from "react-i18next"
import { useIsClassic } from "data/query"
import { useTaxRate } from "data/queries/treasury"
import { Card } from "components/layout"
import { ReadPercent } from "components/token"
import { TooltipIcon } from "components/display"
import DashboardContent from "./components/DashboardContent"

const TaxRate = () => {
  const { t } = useTranslation()
  const { data: taxRate, ...state } = useTaxRate(!useIsClassic())

  const render = () => {
    if (!taxRate) return null
    return (
      <DashboardContent
        value={<ReadPercent fixed={3}>{taxRate}</ReadPercent>}
      />
    )
  }

  return (
    <Card
      {...state}
      title={
        <TooltipIcon
          content={t(
            "Burn tax and other taxes that could be enabled on the network."
          )}
        >
          {t("Tax rate")}
        </TooltipIcon>
      }
      size="small"
    >
      {render()}
    </Card>
  )
}

export default TaxRate
