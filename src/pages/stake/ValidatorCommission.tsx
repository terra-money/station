import { useTranslation } from "react-i18next"
import { readPercent } from "@terra.kitchen/utils"
import { Card } from "components/layout"
import { ToNow } from "components/display"
import ValidatorNumbers from "./components/ValidatorNumbers"
import { Validator } from "@terra-money/terra.js"

const ValidatorCommission = ({ validator }: { validator: Validator }) => {
  const { t } = useTranslation()

  const { commission } = validator
  const { commission_rates, update_time } = commission
  const { max_change_rate, max_rate, rate } = commission_rates

  const commissions = [
    {
      title: t("Current"),
      content: readPercent(rate.toNumber()),
    },
    {
      title: t("Max"),
      content: readPercent(max_rate.toNumber()),
    },
    {
      title: t("Max daily change"),
      content: readPercent(max_change_rate.toNumber()),
    },
    {
      title: t("Last changed"),
      content: <ToNow>{new Date(update_time)}</ToNow>,
    },
  ]

  return (
    <Card title={t("Commission")} bordered>
      <ValidatorNumbers contents={commissions} />
    </Card>
  )
}

export default ValidatorCommission
