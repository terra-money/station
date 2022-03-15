import { useTranslation } from "react-i18next"
import { readPercent } from "@terra.kitchen/utils"
import { TerraValidator } from "types/validator"
import { useUptime } from "data/Terra/TerraAPI"
import { Card } from "components/layout"
import { ToNow } from "components/display"
import ValidatorNumbers from "./components/ValidatorNumbers"

const ValidatorCommission = ({ validator }: { validator: TerraValidator }) => {
  const { t } = useTranslation()

  const { commission } = validator
  const { commission_rates, update_time } = commission
  const { max_change_rate, max_rate, rate } = commission_rates

  const { data: uptime, ...uptimeState } = useUptime(validator)

  const commissions = [
    {
      title: t("Current"),
      content: readPercent(rate),
    },
    {
      title: t("Max"),
      content: readPercent(max_rate),
    },
    {
      title: t("Max daily change"),
      content: readPercent(max_change_rate),
    },
    {
      title: t("Last changed"),
      content: <ToNow>{new Date(update_time)}</ToNow>,
    },
  ]

  return (
    <Card {...uptimeState} title={t("Commission")} bordered>
      <ValidatorNumbers contents={commissions} />
    </Card>
  )
}

export default ValidatorCommission
