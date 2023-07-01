import { useState } from "react"
import { formatNumber } from "@terra-money/terra-utils"
import { useCurrency } from "data/settings/Currency"
import { useThemeAnimation } from "data/settings/Theme"
import { ChartInterval, useLunaPriceChart } from "data/Terra/TerraAPI"
import { Flex, Grid } from "components/layout"
import { Read } from "components/token"
import { convert, LOADING } from "../charts/components/ChartContainer"
import ButtonGroup from "./components/ButtonGroup"
import Chart from "./components/Chart"

const LunaPriceChart = () => {
  const currency = useCurrency()
  const denom = currency.id === "uluna" ? "uusd" : currency.id
  const [chartInterval, setChartInterval] = useState(ChartInterval["15m"])
  const { data, isLoading } = useLunaPriceChart(denom, chartInterval)
  const animation = useThemeAnimation()

  const formatValue = (value: string) => (
    <Read amount={Number(value) * 1e6} denom={denom} auto />
  )

  const tickFormat = {
    "1m": "h:mm aaa",
    "5m": "h:mm aaa",
    "15m": "h:mm aaa",
    "30m": "h:mm aaa",
    "1h": "h aaa",
    "1d": "MMM d",
  }[chartInterval]

  const render = () => {
    if (isLoading) return <img src={animation} alt="" {...LOADING} />
    if (!data) return null
    return (
      <Chart
        type="area"
        data={data.map(convert(formatValue))}
        formatY={(value) => formatNumber(value, { comma: true, integer: true })}
        formatTooltipDate={
          chartInterval === "1d" ? undefined : (date) => date.toLocaleString()
        }
        tickFormat={tickFormat}
        padding={data.find(({ value }) => Number(value) > 1000) ? 48 : 20}
      />
    )
  }

  return (
    <Grid gap={28}>
      <ButtonGroup
        value={chartInterval}
        onChange={setChartInterval}
        options={Object.values(ChartInterval ?? {}).map((value) => {
          return { value, label: value }
        })}
      />

      <Flex>{render()}</Flex>
    </Grid>
  )
}

export default LunaPriceChart
