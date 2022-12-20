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
  useCalcInterchainDelegationsTotal,
} from "data/queries/staking"
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined"
import { useThemeState } from "data/settings/Theme"

const StakedDonut = () => {
  const { t } = useTranslation()
  const [current] = useThemeState()

  const interchainDelegations = useInterchainDelegations()
  const state = combineState(...interchainDelegations)

  const { graphData } = useCalcInterchainDelegationsTotal(interchainDelegations)

  const defaultColors = ["#4672ED", "#7893F5", "#FF7940", "#FF9F40", "#F4BE37"]
  const COLORS = current?.donutColors || defaultColors

  const RenderLegend = (props: any) => {
    const { payload } = props

    return (
      <ul className={styles.legend}>
        {payload.map((entry: any, index: any) => (
          <li key={`item-${index}`} className={styles.detailLine}>
            <div
              className={styles.circle}
              style={{ backgroundColor: entry.color }}
            ></div>
            <img
              className={styles.icon}
              src={entry.payload.icon}
              alt={entry.value}
            />
            <p className={styles.denom}>{entry.value}</p>
            <p className={styles.percent}>
              {Math.round(entry.payload.percent * 100)}%
            </p>
          </li>
        ))}
      </ul>
    )
  }

  const RenderTooltip = (props: any) => {
    const { payload } = props

    return (
      <div className={styles.tooltip}>
        <h6>{payload[0]?.name}</h6>
        <div className={styles.infoLine}>
          <p>Balance: </p>
          <p>{payload[0]?.payload.amount}</p>
        </div>
        <div className={styles.infoLine}>
          <p>Value: </p>
          <p>{payload[0]?.payload.value.toFixed(5)}</p>
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
            <ChainFilter title={t("Staked Funds")} all {...state}>
              {(chain) => (
                <>
                  {graphData[chain || "all"] ? (
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
                            data={graphData[chain || "all"]}
                            cx={125}
                            innerRadius={60}
                            outerRadius={100}
                            fill="#8884d8"
                            paddingAngle={0}
                            dataKey="value"
                          >
                            {graphData[chain || "all"].map(
                              (entry: any, index: any) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index % COLORS.length]}
                                  stroke="none"
                                />
                              )
                            )}
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
