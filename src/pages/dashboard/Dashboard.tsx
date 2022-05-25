/*
 * @Author: lmk
 * @Date: 2022-05-25 11:23:10
 * @LastEditTime: 2022-05-25 17:29:30
 * @LastEditors: lmk
 * @Description:
 */
import { useTranslation } from "react-i18next"
import { Col, Page } from "components/layout"
import StakingRatio from "./StakingRatio"
import styles from "./Dashboard.module.scss"
import StakingReturn from "../charts/StakingReturn"
const Dashboard = () => {
  const { t } = useTranslation()
  return (
    <Page title={t("Dashboard")}>
      <Col>
        <header className={styles.header}>
          <StakingRatio />
          <StakingReturn />
        </header>
      </Col>
    </Page>
  )
}

export default Dashboard
