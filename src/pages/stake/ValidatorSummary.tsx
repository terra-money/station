import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { readPercent } from "@terra-money/terra-utils"
import { TerraValidator } from "types/validator"
import { calcSelfDelegation } from "data/Terra/TerraAPI"
import { Card } from "components/layout"
import { TooltipIcon } from "components/display"
import Uptime from "./components/Uptime"
import ValidatorNumbers from "./components/ValidatorNumbers"

const ValidatorSummary = ({ validator }: { validator: TerraValidator }) => {
  const { t } = useTranslation()

  const { time_weighted_uptime } = validator
  const selfDelegation = calcSelfDelegation(validator)

  const contents = useMemo(() => {
    if (!(selfDelegation || time_weighted_uptime)) return undefined

    return [
      {
        title: t("Self delegation"),
        content: selfDelegation && readPercent(selfDelegation),
      },
      {
        title: (
          <TooltipIcon
            content={t("90 days uptime EMA (Exponential Moving Average)")}
          >
            {t("Uptime")}
          </TooltipIcon>
        ),
        content: time_weighted_uptime && (
          <Uptime>{time_weighted_uptime}</Uptime>
        ),
      },
    ].filter(({ content }) => content)
  }, [t, time_weighted_uptime, selfDelegation])

  return <Card>{contents && <ValidatorNumbers contents={contents} />}</Card>
}

export default ValidatorSummary
