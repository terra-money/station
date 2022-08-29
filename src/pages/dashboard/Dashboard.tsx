/*
 * @Author: lmk
 * @Date: 2022-05-25 11:23:10
 * @LastEditTime: 2022-06-07 09:49:41
 * @LastEditors: lmk
 * @Description:
 */
import { useTranslation } from "react-i18next"
import { Page } from "components/layout"
import StakingRatio from "./StakingRatio"
import DashboardTabs from "./components/DashboardTabs"
const Dashboard = () => {
  const { t } = useTranslation()
  return (
    <Page title={t("Dashboard")}>
      <header>
        <StakingRatio />
        {/* <StakingReturn /> */}
      </header>
      <DashboardTabs />
    </Page>
  )
}

export default Dashboard
