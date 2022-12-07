import { useTranslation } from "react-i18next"
import { LinkButton } from "components/general"
import { Col, Page, Row } from "components/layout"
import Staked from "./Staked"
import Validators from "./Validators"
import StakedDonut from "./StakedDonut"
import { useInterchainDelegations } from "data/queries/staking"

const Stake = () => {
  const { t } = useTranslation()

  const interchainDelegations = useInterchainDelegations()

  if (!interchainDelegations) return null

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
        {interchainDelegations.length ? (
          <Row>
            <StakedDonut />
            <Staked />
          </Row>
        ) : (
          <Staked />
        )}
        <Validators />
      </Col>
    </Page>
  )
}

export default Stake
