import { useState } from "react"
import { useTranslation } from "react-i18next"
import { last } from "ramda"
import capitalize from "@mui/utils/capitalize"
import { formatNumber } from "@terra.kitchen/utils"
import { AggregateWallets } from "data/Terra/TerraAPI"
import { useWallets } from "data/Terra/TerraAPI"
import { Select } from "components/form"
import { Card } from "components/layout"
import { TooltipIcon } from "components/display"
import ChartContainer from "./components/ChartContainer"
import Range from "./components/Range"
import Filter from "./components/Filter"

const Wallets = () => {
  const { t } = useTranslation()

  /* data */
  const [walletsType, setWalletsType] = useState(AggregateWallets.TOTAL)
  const { data, ...state } = useWallets(walletsType)

  /* render */
  const renderFilter = () => {
    return (
      <Filter>
        <Select
          value={walletsType}
          onChange={(e) => setWalletsType(e.target.value as AggregateWallets)}
          small
        >
          {Object.values(AggregateWallets).map((type) => (
            <option value={type} key={type}>
              {capitalize(type)}
            </option>
          ))}
        </Select>
      </Filter>
    )
  }

  const isCumulative = walletsType === AggregateWallets.TOTAL
  const render = () => {
    return (
      <Range>
        {(range) => {
          const filled = !isCumulative && !range
          return (
            <ChartContainer
              type={isCumulative || filled ? "area" : "bar"}
              filled={filled}
              result={data}
              range={range}
              total={data && last(data)?.value}
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
