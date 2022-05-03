import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { readPercent } from "@terra.kitchen/utils"
import { TerraValidator } from "types/validator"
import { calcSelfDelegation } from "data/Terra/TerraAPI"
import { Card } from "components/layout"
import { TooltipIcon } from "components/display"
import Uptime from "./components/Uptime"
import ValidatorNumbers from "./components/ValidatorNumbers"

const ValidatorSummary = ({ validator }: { validator: TerraValidator }) => {
  const { t } = useTranslation()

  const { time_weighted_uptime } = validator

  const contents = useMemo(() => {
    if (!time_weighted_uptime) return []

    return [
      {
        title: t("Self delegation"),
        content: readPercent(calcSelfDelegation(validator)),
      },
      {
        title: (
          <TooltipIcon
            content={t("90 days uptime EMA (Exponential Moving Average)")}
          >
            {t("Uptime")}
          </TooltipIcon>
        ),
        content: <Uptime>{time_weighted_uptime}</Uptime>,
      },
    ]
  }, [t, time_weighted_uptime, validator])

  return <Card>{contents && <ValidatorNumbers contents={contents} />}</Card>
}

export default ValidatorSummary
