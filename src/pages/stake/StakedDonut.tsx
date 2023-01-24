import { useTranslation } from "react-i18next"
import { combineState } from "data/query"
import { Card, Col, Flex, Grid } from "components/layout"
import { Fetching } from "components/feedback"
import styles from "./StakedDonut.module.scss"
import ChainFilter from "components/layout/ChainFilter"
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import {
  useInterchainDelegations,
  useInterchainValidators,
  useCalcDelegationsByValidator,
} from "data/queries/staking"
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined"
import { useThemeState } from "data/settings/Theme"
import ProfileIcon from "./components/ProfileIcon"
import { Read } from "components/token"
import { useCurrency } from "data/settings/Currency"

const StakedDonut = () => {
  const { t } = useTranslation()
  const [current] = useThemeState()
  const currency = useCurrency()

  const interchainDelegations = useInterchainDelegations()
  const interchainValidators = useInterchainValidators()
  const state = combineState(...interchainDelegations, ...interchainValidators)

  const { graphData } = useCalcDelegationsByValidator(
    interchainDelegations,
    interchainValidators
  )

  const defaultColors = ["#7893F5", "#7c1ae5", "#FF7940", "#FF9F40", "#acacac"]
  const COLORS = current?.donutColors || defaultColors

  const RenderLegend = (props: { chainSelected: boolean; payload?: any }) => {
    const { payload, chainSelected } = props

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
              {chainSelected ? (
                <>
                  {entry.payload.identity !== "Other" && (
                    <ProfileIcon src={entry.payload.identity} size={22} />
                  )}
                  <p className={styles.denom}>{entry.payload.moniker}</p>
                  <p className={styles.percent}>
                    {percentage < 1 ? `< ${percentage}` : percentage}%
                  </p>
                </>
              ) : (
                <>
                  <img
                    className={styles.icon}
                    src={entry.payload.icon}
                    alt={entry.value}
                  />
                  <p className={styles.denom}>{entry.value}</p>
                  <p className={styles.percent}>
                    {Math.round(entry.payload.percent * 100)}%
                  </p>
                </>
              )}
            </li>
          )
        })}
      </ul>
    )
  }

  const RenderTooltip = (props: { chainSelected: boolean; payload?: any }) => {
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
    if (!interchainDelegations) return null

    return (
      <Col span={2}>
        <div className={styles.forFetchingBar}>
          <Fetching {...state}>
            <ChainFilter title={t("Staked funds")} all {...state}>
              {(chain) => (
                <>
                  {graphData && graphData[chain || "all"] ? (
                    <section className={styles.graphContainer}>
                      <ResponsiveContainer>
                        <PieChart>
                          <Legend
                            layout="vertical"
                            verticalAlign="middle"
                            align="right"
                            content={<RenderLegend chainSelected={!!chain} />}
                            className="legend"
                          />
                          <Tooltip
                            content={<RenderTooltip chainSelected={!!chain} />}
                          />
                          <Pie
                            data={graphData[chain || "all"]}
                            cx={125}
                            innerRadius={60}
                            outerRadius={100}
                            fill="#8884d8"
                            paddingAngle={0}
                            dataKey="value"
                          >
                            {graphData[chain || "all"].map((_, index) => (
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
                    <Card className={styles.noDelegationsCard}>
                      <article className={styles.vertical}>
                        <Flex>
                          <PaymentsOutlinedIcon style={{ fontSize: 56 }} />
                        </Flex>

                        <section className={styles.main}>
                          <h1 className={styles.title}>
                            {t("No Delegations")}
                          </h1>

                          <Grid gap={8}>
                            <p>
                              {t("There are no delegations on this chain.")}
                            </p>
                          </Grid>
                        </section>
                      </article>
                    </Card>
                  )}
                </>
              )}
            </ChainFilter>
          </Fetching>
        </div>
      </Col>
    )
  }

  return render()
}

export default StakedDonut
