import { useTranslation } from "react-i18next"
import { Card, Flex, Grid } from "components/layout"
import styles from "./StakedDonut.module.scss"
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { useStakeChartData } from "data/queries/staking"
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined"
import { useThemeState } from "data/settings/Theme"
import { Read } from "components/token"
import { useCurrency } from "data/settings/Currency"

const StakedDonut = ({ chain }: { chain?: string }) => {
  const { t } = useTranslation()
  const [current] = useThemeState()
  const currency = useCurrency()

  const { data: chartData, ...state } = useStakeChartData(chain)

  const defaultColors = ["#7893F5", "#7c1ae5", "#FF7940", "#FF9F40", "#acacac"]
  const COLORS = current?.donutColors || defaultColors

  const RenderLegend = (props: { payload?: any }) => {
    const { payload } = props

    return (
      <ul className={styles.legend}>
        {payload.map((entry: any, index: any) => {
          const percentage = Math.round(entry.payload.percent * 100)
          return (
            <li key={`item-${index}`} className={styles.detailLine}>
              <div
                className={styles.circle}
                style={{ backgroundColor: entry.color }}
              ></div>

              <>
                <img
                  className={styles.icon}
                  src={entry.payload.icon}
                  alt={entry.value}
                />
                <p className={styles.denom}>{entry.value}</p>
                <p className={styles.percent}>
                  {payload.length === 1
                    ? `100`
                    : percentage < 1
                    ? `< 1`
                    : percentage}
                  %
                </p>
              </>
            </li>
          )
        })}
      </ul>
    )
  }

  const RenderTooltip = (props: { payload?: any }) => {
    const { payload } = props

    return (
      <div className={styles.tooltip}>
        <h6>{payload[0]?.payload.name || payload[0]?.payload.moniker}</h6>
        <div className={styles.infoLine}>
          <p>Balance: </p>
          <p>
            <Read
              amount={payload[0]?.payload.amount}
              fixed={2}
              token={payload[0]?.payload.denom}
            />
          </p>
        </div>
        <div className={styles.infoLine}>
          <p>Value: </p>
          <p>
            <Read amount={payload[0]?.payload.value} fixed={2} decimals={0} />{" "}
            {currency.symbol}
          </p>
        </div>
      </div>
    )
  }

  const render = () => {
    return (
      <>
        {chartData?.length ? (
          <section className={styles.graphContainer}>
            <ResponsiveContainer>
              <PieChart>
                <Legend
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                  content={<RenderLegend />}
                  className="legend"
                />
                <Tooltip content={<RenderTooltip />} />
                <Pie
                  data={chartData}
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={0}
                  dataKey={
                    chartData.reduce((acc, { value }) => acc + value, 0) === 0
                      ? "amount"
                      : "value"
                  }
                >
                  {chartData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      stroke="none"
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </section>
        ) : (
          <Card className={styles.noDelegationsCard} {...state}>
            <article className={styles.vertical}>
              <Flex>
                <PaymentsOutlinedIcon style={{ fontSize: 56 }} />
              </Flex>

              <section className={styles.main}>
                <h1 className={styles.title}>{t("No Delegations")}</h1>

                <Grid gap={8}>
                  <p>
                    {chain
                      ? t("There are no delegations on this chain.")
                      : t("There are no delegations.")}
                  </p>
                </Grid>
              </section>
            </article>
          </Card>
        )}
      </>
    )
  }

  return render()
}

export default StakedDonut
