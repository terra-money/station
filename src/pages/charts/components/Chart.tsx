import { ReactNode } from "react"
import { ResponsiveContainer } from "recharts"
import { AreaChart, Area, BarChart, Bar } from "recharts"
import { XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { format } from "date-fns"
import variable from "styles/variable"
import ChartTooltip from "./ChartTooltip"

export const CHART_HEIGHT = 240
const ANIMATION_DURATION = 100
const FONT_SIZE = 11

export interface ChartPoint {
  t: Date
  v: number
  y: ReactNode
}

export interface ChartProps {
  type: "bar" | "area"
  formatY: (value: string) => string
  formatTooltipDate?: (date: Date) => string

  /* customize */
  ticks?: number[]
  tickFormat?: string
  padding?: number

  /* filled bar */
  filled?: boolean
}

interface Props extends ChartProps {
  data: ChartPoint[]
}

const Chart = ({ type = "area", data, formatY, filled, ...props }: Props) => {
  const { ticks, tickFormat, formatTooltipDate, padding } = props

  const COLORS = {
    // Call this fn inside the component to get the latest theme
    STROKE: variable("--chart"),
    DEFAULT: variable("--button-default-bg"),
    MUTED: variable("--text-muted"),
    BORDER: variable("--card-border"),
  }

  /* by chart type */
  const renderChart = {
    bar: (children: ReactNode) => (
      <BarChart data={data}>
        {children}
        <Bar
          dataKey="v"
          fill={COLORS.STROKE}
          animationDuration={ANIMATION_DURATION}
        />
      </BarChart>
    ),
    area: (children: ReactNode) => (
      <AreaChart data={data}>
        {children}
        <Area
          dataKey="v"
          type="monotone"
          stroke={COLORS.STROKE}
          strokeWidth={filled ? 0 : 2}
          fill={COLORS.STROKE}
          fillOpacity={filled ? 1 : 0.05}
          animationDuration={ANIMATION_DURATION}
        />
      </AreaChart>
    ),
  }

  return (
    <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
      {renderChart[type](
        <>
          <XAxis
            dataKey="t"
            fontSize={FONT_SIZE}
            minTickGap={30} // Margin between each text
            tick={{ fill: COLORS.MUTED }} // Text color
            tickFormatter={(t) =>
              format(t, tickFormat ?? (data.length > 30 ? "yyyy QQQ" : "MMM d"))
            }
            tickMargin={8} // Padding between text and chart
            tickSize={0} // Line between text and chart
            height={24} // Space including padding
          />
          <YAxis
            dataKey="v"
            axisLine={false} // Show the vertical line
            fontSize={FONT_SIZE}
            orientation="right"
            tick={{ fill: COLORS.MUTED }} // Text color
            ticks={ticks}
            tickFormatter={formatY}
            tickMargin={4} // Padding between text and chart
            tickSize={0} // Line between text and chart
            width={padding ?? 40} // Space including padding
          />
          <Tooltip
            cursor={{ fill: COLORS.BORDER, stroke: COLORS.BORDER }}
            content={<ChartTooltip formatDate={formatTooltipDate} />}
          />
          <CartesianGrid stroke={COLORS.BORDER} vertical={false} />
        </>
      )}
    </ResponsiveContainer>
  )
}

export default Chart
