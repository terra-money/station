import { useState } from "react"
import { useTranslation } from "react-i18next"
import { LinkButton } from "components/general"
import { Col, Page, Row, Tabs } from "components/layout"
import Staked from "./Staked"
import Validators from "./Validators"
import StakedDonut from "./StakedDonut"
import { useStakeChartData } from "data/queries/staking"
import QuickStake from "./QuickStake"
import { TooltipIcon } from "components/display"
import QuickStakeTooltip from "./QuickStakeTooltip"
import { Fetching } from "components/feedback"
import styles from "./StakedDonut.module.scss"
import ChainFilter from "components/layout/ChainFilter"
import DelegationsPromote from "app/containers/DelegationsPromote"
import { ChainFeature } from "types/chains"

const Stake = () => {
  const { t } = useTranslation()
  const [chainSelected, setChainSelected] = useState("all")

  const { data: chartData, ...state } = useStakeChartData()

  const tabs = [
    {
      key: "quick",
      tab: t("Quick Stake"),
      children: <QuickStake />,
      extra: <TooltipIcon content={<QuickStakeTooltip />} placement="bottom" />,
    },
    {
      key: "manual",
      tab: t("Manual Stake"),
      children: <Validators />,
    },
  ]

  return (
    <Page
      title={t("Stake")}
      extra={
        <LinkButton to="/rewards" color="primary" size="small">
          {t("Withdraw all rewards")}
        </LinkButton>
      }
    >
      <Col>
        {chartData.length ? (
          <Row>
            <Col span={2}>
              <div className={styles.forFetchingBar}>
                <Fetching {...state}>
                  <ChainFilter
                    title={t("Staked funds")}
                    feature={ChainFeature.STAKING}
                    all
                    {...state}
                  >
                    {(chain) => {
                      setChainSelected(chain || "all")
                      return <StakedDonut chain={chain} />
                    }}
                  </ChainFilter>
                </Fetching>
              </div>
            </Col>
            <Staked chain={chainSelected} />
          </Row>
        ) : (
          <DelegationsPromote horizontal />
        )}

        <Tabs tabs={tabs} type="page" state />
      </Col>
    </Page>
  )
}

export default Stake
