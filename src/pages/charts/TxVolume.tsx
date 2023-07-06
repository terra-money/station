import { useCallback, useState } from "react"
import { useTranslation } from "react-i18next"
import BigNumber from "bignumber.js"
import { head, last } from "ramda"
import { capitalize } from "@mui/material"
import {
  isDenomTerraNative,
  readAmount,
  readDenom,
} from "@terra-money/terra-utils"
import { sortDenoms } from "utils/coin"
import { useCurrency } from "data/settings/Currency"
import { Aggregate, useTxVolume } from "data/Terra/TerraAPI"
import { useActiveDenoms } from "data/queries/coingecko"
import { Select } from "components/form"
import { Card } from "components/layout"
import { TooltipIcon } from "components/display"
import ChartContainer from "./components/ChartContainer"
import Filter from "./components/Filter"
import Range from "./components/Range"

const TxVolume = () => {
  const { t } = useTranslation()
  const currency = useCurrency()

  /* data */
  const [denom, setDenom] = useState("uluna")
  const [type, setType] = useState<Aggregate>(Aggregate.PERIODIC)
  const { data: activeDenoms } = useActiveDenoms()
  const { data, ...state } = useTxVolume(denom, type)

  /* render */
  const renderFilter = () => {
    if (!activeDenoms) return null
    return (
      <Filter>
        <Select value={denom} onChange={(e) => setDenom(e.target.value)} small>
          {sortDenoms(activeDenoms, currency.id)
            .filter(isDenomTerraNative)
            .map((denom) => (
              <option value={denom} key={denom}>
                {readDenom(denom)}
              </option>
            ))}
        </Select>

        <Select
          value={type}
          onChange={(e) => setType(e.target.value as Aggregate)}
          small
        >
          {Object.values(Aggregate ?? {}).map((type) => (
            <option value={type} key={type}>
              {capitalize(type)}
            </option>
          ))}
        </Select>
      </Filter>
    )
  }

  const calcValue = useCallback(
    (range: number) => {
      if (!data) return

      const sliced = data.slice(-1 * range).map(({ value }) => value)
      const h = head(sliced)
      const l = last(sliced)
      const t = sliced[sliced.length - 2]

      if (!(h && l && t)) return

      if (range === 3)
        return {
          [Aggregate.CUMULATIVE]: new BigNumber(l).minus(t).toString(),
          [Aggregate.PERIODIC]: l,
        }[type]

      return {
        [Aggregate.CUMULATIVE]: new BigNumber(l).minus(h).toString(),
        [Aggregate.PERIODIC]: BigNumber.sum(...sliced.slice(1)).toString(),
      }[type]
    },
    [data, type]
  )

  const render = () => {
    return (
      <Range initial={3} includeLastDay>
        {(range) => {
          const filled = type === Aggregate.PERIODIC && !range
          return (
            <ChartContainer
              type={type === Aggregate.CUMULATIVE || filled ? "area" : "bar"}
              filled={filled}
              result={data}
              range={range}
              total={calcValue(range)}
              unit={readDenom(denom)}
              formatValue={(value) => readAmount(value, { prefix: true })}
              formatY={(value) =>
                readAmount(value, { prefix: true, integer: true })
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
            "The onchain transaction volume for the selected currency over the selected time period"
          )}
        >
          {t("Transaction volume")}
        </TooltipIcon>
      }
      extra={renderFilter()}
      size="small"
    >
      {render()}
    </Card>
  )
}

export default TxVolume
