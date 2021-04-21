import { useTranslation } from "react-i18next"
import { useTaxRate } from "data/queries/treasury"
import { Card } from "components/layout"
import { ReadPercent } from "components/token"
import { TooltipIcon } from "components/display"
import DashboardContent from "./components/DashboardContent"
import DashboardTag from "./components/DashboardTag"

const TaxRate = () => {
  const { t } = useTranslation()
  const { data: taxRate, ...state } = useTaxRate()

  const render = () => {
    if (!taxRate) return null
    return (
      <DashboardContent
        value={<ReadPercent fixed={3}>{taxRate}</ReadPercent>}
        footer={<DashboardTag>{t("Capped at 1 SDT")}</DashboardTag>}
      />
    )
  }

  return (
    <Card
      {...state}
      title={
        <TooltipIcon
          content={t(
            "Fees added to any Terra stablecoin transaction, excluding market swaps, to provide stability in the market."
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
