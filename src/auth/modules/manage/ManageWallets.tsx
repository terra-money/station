import { useTranslation } from "react-i18next"
import QrCodeIcon from "@mui/icons-material/QrCode"
import PasswordIcon from "@mui/icons-material/Password"
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline"
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined"
import LogoutIcon from "@mui/icons-material/Logout"
import { Col, Page } from "components/layout"
import is from "../../scripts/is"
import useAuth from "../../hooks/useAuth"
import AuthList from "../../components/AuthList"
import ConnectedWallet from "./ConnectedWallet"

export const useManageWallet = () => {
  const { t } = useTranslation()
  const { wallet } = useAuth()

  const toExport = {
    to: "/auth/export",
    children: t("Export wallet"),
    icon: <QrCodeIcon />,
  }

  const toPassword = {
    to: "/auth/password",
    children: t("Change password"),
    icon: <PasswordIcon />,
  }

  const toDelete = {
    to: "/auth/delete",
    children: t("Delete wallet"),
    icon: <DeleteOutlineIcon />,
  }

  const toSignMultisig = {
    to: "/multisig/sign",
    children: t("Sign a multisig tx"),
    icon: <FactCheckOutlinedIcon />,
  }

  const toPostMultisig = {
    to: "/multisig/post",
    children: t("Post a multisig tx"),
    icon: <FactCheckOutlinedIcon />,
  }

  const toDisconnect = {
    to: "/auth/disconnect",
    children: t("Disconnect"),
    icon: <LogoutIcon />,
  }

  if (!wallet) return

  return is.ledger(wallet)
    ? [toSignMultisig, toDisconnect]
    : is.multisig(wallet)
    ? [toPostMultisig, toDelete, toDisconnect]
    : [toExport, toPassword, toDelete, toSignMultisig, toDisconnect]
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
