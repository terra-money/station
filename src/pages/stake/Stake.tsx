import { useTranslation } from "react-i18next"
import { LinkButton } from "components/general"
import { Col, Page } from "components/layout"
import Staked from "./Staked"
import Validators from "./Validators"

const Stake = () => {
  const { t } = useTranslation()

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
        <Staked />
        <Validators />
      </Col>
    </Page>
  )
}

export default Stake
