import { useState } from "react"
import { useTranslation } from "react-i18next"
import { last } from "ramda"
import capitalize from "@mui/utils/capitalize"
import { formatNumber } from "@terra.kitchen/utils"
import { Aggregate, AggregateWallets } from "data/Terra/TerraAPI"
import { useWallets } from "data/Terra/TerraAPI"
import { combineState } from "data/query"
import { Select } from "components/form"
import { Card } from "components/layout"
import { TooltipIcon } from "components/display"
import ChartContainer from "./components/ChartContainer"
import Range from "./components/Range"
import Filter from "./components/Filter"

const Wallets = () => {
  const { t } = useTranslation()

  /* data */
  const [filters, setFilters] = useState({
    walletsType: AggregateWallets.TOTAL,
    type: Aggregate.CUMULATIVE,
  })

  const { walletsType, type } = filters
  const { data, ...result } = useWallets(walletsType, type)
  const totalResult = useWallets(AggregateWallets.TOTAL, type) // for value
  const { data: total, ...totalState } = totalResult
  const state = combineState(result, totalState)

  const handleChange = (
    key: "walletsType" | "type",
    value: AggregateWallets | Aggregate
  ) => {
    const next = { ...filters, [key]: value }

    const invalid =
      next.walletsType === AggregateWallets.ACTIVE &&
      next.type === Aggregate.CUMULATIVE

    if (!invalid) setFilters(next)
    else if (key === "walletsType")
      setFilters({ ...next, type: Aggregate.PERIODIC })
    else setFilters({ ...next, walletsType: AggregateWallets.TOTAL })
  }

  /* render */
  const renderFilter = () => {
    return (
      <Filter>
        <Select
          value={walletsType}
          onChange={(e) =>
            handleChange("walletsType", e.target.value as AggregateWallets)
          }
          small
        >
          {Object.values(AggregateWallets).map((type) => (
            <option value={type} key={type}>
              {capitalize(type)}
            </option>
          ))}
        </Select>

        <Select
          value={type}
          onChange={(e) => handleChange("type", e.target.value as Aggregate)}
          small
        >
          {Object.values(Aggregate).map((type) => (
            <option value={type} key={type}>
              {capitalize(type)}
            </option>
          ))}
        </Select>
      </Filter>
    )
  }

  const render = () => {
    return (
      <Range>
        {(range) => {
          const filled = type === Aggregate.PERIODIC && !range
          return (
            <ChartContainer
              type={type === Aggregate.CUMULATIVE || filled ? "area" : "bar"}
              filled={filled}
              result={data}
              range={range}
              total={total && last(total)?.value}
              unit={t("wallets")}
              formatValue={(value) => formatNumber(value, { prefix: true })}
              formatY={(value) =>
                formatNumber(value, { prefix: true, fixed: 1 })
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
            "Number of total registered wallets in the selected period"
          )}
        >
          {t("Wallets")}
        </TooltipIcon>
      }
      extra={renderFilter()}
      size="small"
    >
      {render()}
    </Card>
  )
}

export default Wallets
