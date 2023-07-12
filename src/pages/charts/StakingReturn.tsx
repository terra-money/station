import { useState } from "react"
import { useTranslation } from "react-i18next"
import { last } from "ramda"
import { capitalize } from "@mui/material"
import { readPercent } from "@terra-money/terra-utils"
import { AggregateStakingReturn } from "data/Terra/TerraAPI"
import { useStakingReturn } from "data/Terra/TerraAPI"
import { Select } from "components/form"
import { Card } from "components/layout"
import { TooltipIcon } from "components/display"
import { ReadPercent } from "components/token"
import ChartContainer from "./components/ChartContainer"
import Range from "./components/Range"
import Filter from "./components/Filter"

const StakingReturn = () => {
  const { t } = useTranslation()

  /* data */
  const [type, setType] = useState<AggregateStakingReturn>(
    AggregateStakingReturn.ANNUALIZED
  )

  const { data, ...state } = useStakingReturn(type)

  /* render */
  const renderFilter = () => {
    return (
      <Filter>
        <Select
          value={type}
          onChange={(e) => setType(e.target.value as AggregateStakingReturn)}
          small
        >
          {Object.values(AggregateStakingReturn ?? {}).map((type) => (
            <option value={type} key={type}>
              {capitalize(type)}
            </option>
          ))}
        </Select>
      </Filter>
    )
  }

  const unit = {
    [AggregateStakingReturn.ANNUALIZED]: t("year"),
    [AggregateStakingReturn.DAILY]: t("day"),
  }

  const render = () => {
    if (!data) return null
    return (
      <Range>
        {(range) => {
          const filled = type === AggregateStakingReturn.DAILY && !range
          return (
            <ChartContainer
              type={
                type === AggregateStakingReturn.ANNUALIZED || filled
                  ? "area"
                  : "bar"
              }
              filled={filled}
              result={data}
              range={range}
              total={data && last(data)?.value}
              unit={`/ ${unit[type]}`}
              formatValue={(value) => <ReadPercent>{value}</ReadPercent>}
              formatY={(value) => readPercent(value, { fixed: 0 })}
              ticks={
                type === AggregateStakingReturn.ANNUALIZED && !range
                  ? [0, 1, 2, 3]
                  : undefined
              }
            />
          )
        }}
      </Range>
    )
  }

  return (
    <Card
      {...state}
      title={
        <TooltipIcon
          content={t(
            "The annualized staking yield for Luna is based on gas rewards, minting rewards, and the price of Luna (annualized return = 10 day moving average return * 365)."
          )}
        >
          {t("Staking return")}
        </TooltipIcon>
      }
      size="small"
      extra={renderFilter()}
    >
      {render()}
    </Card>
  )
}

export default StakingReturn
