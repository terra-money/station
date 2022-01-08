import { useTranslation } from "react-i18next"
import QrCodeIcon from "@mui/icons-material/QrCode"
import PasswordIcon from "@mui/icons-material/Password"
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline"
import LogoutIcon from "@mui/icons-material/Logout"
import { Col, Page } from "components/layout"
import useAuth from "../../hooks/useAuth"
import AuthList from "../../components/AuthList"
import ConnectedWallet from "./ConnectedWallet"

export const useManageWallet = () => {
  const { t } = useTranslation()
  const { wallet } = useAuth()

  if (!wallet) return

  return "ledger" in wallet
    ? [
        {
          to: "/auth/disconnect",
          children: t("Disconnect"),
          icon: <LogoutIcon />,
        },
      ]
    : [
        {
          to: "/auth/export",
          children: t("Export wallet"),
          icon: <QrCodeIcon />,
        },
        {
          to: "/auth/password",
          children: t("Change password"),
          icon: <PasswordIcon />,
        },
        {
          to: "/auth/delete",
          children: t("Delete wallet"),
          icon: <DeleteOutlineIcon />,
        },
        {
          to: "/auth/disconnect",
          children: t("Disconnect"),
          icon: <LogoutIcon />,
        },
      ]
}

const ManageWallets = () => {
  const { t } = useTranslation()
  const { available } = useAuth()
  const list = useManageWallet()

  return (
    <Page title={t("Manage wallets")}>
      <Col>
        <ConnectedWallet>
          {list && <AuthList list={list} />}
          {!!available.length && <AuthList list={available} />}
        </ConnectedWallet>
      </Col>
    </Page>
  )
}
export default ManageWallets
