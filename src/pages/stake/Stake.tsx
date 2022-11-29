import { useTranslation } from "react-i18next"
import { LinkButton } from "components/general"
import { Col, Page, Row } from "components/layout"
import classNames from "classnames/bind"
import Staked from "./Staked"
import Validators from "./Validators"
import StakedDonut from "./StakedDonut"
import styles from "./Stake.module.scss"

const cx = classNames.bind(styles)

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
        <Row>
          <StakedDonut status={2} />
          <Staked />
        </Row>
        {/* <header className={cx(styles.header, { trisect: false })}>
          <StakedDonut />
          <Staked />
        </header> */}

        <Validators />
      </Col>
    </Page>
  )
}

export default Stake
