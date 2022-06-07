import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate, useRoutes } from "react-router-dom"

import { ReactComponent as StakeIcon } from "styles/images/menu/Stake.svg"

/* menu */
import Dashboard from "pages/dashboard/Dashboard"
import Stake from "pages/stake/Stake"

/* details */
import ValidatorDetails from "pages/stake/ValidatorDetails"
/* txs */
import StakeTx from "txs/stake/StakeTx"
import WithdrawRewardsTx from "txs/stake/WithdrawRewardsTx"
import WithdrawCommissionTx from "txs/stake/WithdrawCommissionTx"

/* auth */
import Auth from "auth/modules/Auth"

/* settings */
import Settings from "pages/Settings"

/* 404 */
import NotFound from "pages/NotFound"
import FAQ from "pages/faq"

const ICON_SIZE = { width: 20, height: 20 }

export const useNav = () => {
  const { t } = useTranslation()

  const menu = [
    {
      path: "/stake",
      element: <Stake />,
      title: t("Stake"),
      icon: <StakeIcon {...ICON_SIZE} />,
    },
  ]

  const routes = [
    { path: "/", element: <Dashboard /> },

    /* pages */
    ...menu,
    { path: "/validator/:address", element: <ValidatorDetails /> },

    /* txs */
    { path: "/stake/:address", element: <StakeTx /> },
    { path: "/rewards", element: <WithdrawRewardsTx /> },
    { path: "/commission", element: <WithdrawCommissionTx /> },

    /* auth */
    { path: "/auth/*", element: <Auth /> },
    { path: "/settings", element: <Settings /> },
    { path: "/faq", element: <FAQ />, hideHeader: true },

    /* 404 */
    { path: "*", element: <NotFound /> },
  ]

  return { menu, element: useRoutes(routes) }
}

/* helpers */
export const useGoBackOnError = ({ error }: QueryState) => {
  const navigate = useNavigate()
  useEffect(() => {
    if (error) navigate("..", { replace: true })
  }, [error, navigate])
}
