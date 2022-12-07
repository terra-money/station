import { useState } from "react"
import { useTranslation } from "react-i18next"
import { combineState } from "data/query"
import { Col } from "components/layout"
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

const StakedDonut = () => {
  const { t } = useTranslation()

  const interchainDelegations = useInterchainDelegations()
  const state = combineState(...interchainDelegations)

  const { currencyTotal, tableData } = useCalcInterchainDelegationsTotal(
    interchainDelegations
  )

  const COLORS = ["#4672ED", "#7893F5", "#FF7940", "#FF9F40", "#F4BE37"]

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
        <ChainFilter title={t("Staked Funds")} all>
          {(chain) => {
            return (
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
                      data={tableData[chain || "all"]}
                      cx={125}
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={0}
                      dataKey="value"
                    >
                      {tableData[chain || "all"].map(
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
            )
          }}
        </ChainFilter>
      </Col>
    )
  }

  return <Fetching {...state}>{render()}</Fetching>
}

export default StakedDonut
