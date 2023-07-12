import { useState } from "react"
import { useTranslation } from "react-i18next"
import { last } from "ramda"
import BigNumber from "bignumber.js"
import { capitalize } from "@mui/material"
import { formatNumber } from "@terra-money/terra-utils"
import { combineState } from "data/query"
import { AggregateWallets, useSumActiveWallets } from "data/Terra/TerraAPI"
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
  const { data, ...dataState } = useWallets(walletsType)
  const { data: sumActiveWallets, ...sumActiveWalletsState } =
    useSumActiveWallets()

  const state = combineState(dataState, sumActiveWalletsState)

  /* render */
  const renderFilter = () => {
    return (
      <Filter>
        <Select
          value={walletsType}
          onChange={(e) => setWalletsType(e.target.value as AggregateWallets)}
          small
        >
          {Object.values(AggregateWallets ?? {}).map((type) => (
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
          const values = data?.slice(-1 * range).map(({ value }) => value)
          const total = {
            [AggregateWallets.TOTAL]: data && last(data)?.value,
            [AggregateWallets.NEW]:
              values && BigNumber.sum(...values).toString(),
            [AggregateWallets.ACTIVE]: sumActiveWallets?.[range],
          }[walletsType]

          return (
            <ChartContainer
              type={isCumulative || filled ? "area" : "bar"}
              filled={filled}
              result={data}
              range={range}
              total={total}
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
