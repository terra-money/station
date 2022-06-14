import { useTranslation } from "react-i18next"
import { LinkButton } from "components/general"
import { Col, Page } from "components/layout"
import Staked from "./Staked"
import Validators from "./Validators"
import is from "auth/scripts/is"

const Stake = () => {
  const { t } = useTranslation()

  return (
    <Page
      title={is.mobile() ? "" : t("Stake")}
      extra={
        is.mobile() ? (
          ""
        ) : (
          <LinkButton to="/rewards" color="primary" size="small">
            {t("Withdraw all rewards")}
          </LinkButton>
        )
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
