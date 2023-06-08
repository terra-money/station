import { useTranslation } from "react-i18next"
import { readPercent } from "@terra-money/terra-utils"
import { Card } from "components/layout"
import { DateTimeRenderer } from "components/display"
import ValidatorNumbers from "./components/ValidatorNumbers"
import { Validator } from "@terra-money/feather.js"

const ValidatorCommission = ({ validator }: { validator: Validator }) => {
  const { t } = useTranslation()

  const { commission } = validator
  const { commission_rates, update_time } = commission
  const { max_change_rate, max_rate, rate } = commission_rates

  const commissions = [
    {
      title: t("Current"),
      content: readPercent(Number(rate)),
    },
    {
      title: t("Max"),
      content: readPercent(Number(max_rate)),
    },
    {
      title: t("Max daily change"),
      content: readPercent(Number(max_change_rate)),
    },
    {
      title: t("Last changed"),
      content: (
        <DateTimeRenderer format={"localestring"}>
          {update_time}
        </DateTimeRenderer>
      ),
    },
  ]

  return (
    <Card title={t("Commission")} bordered twoTone>
      <ValidatorNumbers contents={commissions} />
    </Card>
  )
}

export default ValidatorCommission
