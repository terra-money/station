import { useTranslation } from "react-i18next"
import { LinkButton } from "components/general"
import { Col, Page, Row, Tabs } from "components/layout"
import Staked from "./Staked"
import Validators from "./Validators"
import StakedDonut from "./StakedDonut"
import {
  useInterchainDelegations,
  useCalcInterchainDelegationsTotal,
} from "data/queries/staking"
import QuickStake from "./QuickStake"
import { TooltipIcon } from "components/display"
import QuickStakeTooltip from "./QuickStakeTooltip"

const Stake = () => {
  const { t } = useTranslation()

  const interchainDelegations = useInterchainDelegations()
  const { graphData } = useCalcInterchainDelegationsTotal(interchainDelegations)

  const tabs = [
    {
      key: "quick",
      tab: "Quick Stake",
      children: <QuickStake />,
      extra: <TooltipIcon content={<QuickStakeTooltip />} placement="bottom" />,
    },
    {
      key: "manual",
      tab: "Manual Stake",
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
        {graphData?.all.length ? (
          <Row>
            <StakedDonut />
            <Staked />
          </Row>
        ) : (
          <Staked />
        )}

        <Tabs tabs={tabs} type="page" />
      </Col>
    </Page>
  )
}

export default Stake
