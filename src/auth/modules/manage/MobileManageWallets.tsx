import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import QrCodeIcon from "@mui/icons-material/QrCode"
import PasswordIcon from "@mui/icons-material/Password"
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline"
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined"
import LogoutIcon from "@mui/icons-material/Logout"
import LockOutlinedIcon from "@mui/icons-material/LockOutlined"
import is from "../../scripts/is"
import useAuth from "../../hooks/useAuth"
import AuthList from "../../components/AuthList"

export const useManageWallet = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { wallet, disconnect, lock } = useAuth()

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

  const disconnectWallet = {
    onClick: () => {
      disconnect()
      navigate("/wallet", { replace: true })
    },
    children: t("Disconnect"),
    icon: <LogoutIcon />,
  }

  const lockWallet = {
    onClick: () => {
      lock()
      navigate("/wallet", { replace: true })
    },
    children: t("Lock"),
    icon: <LockOutlinedIcon />,
  }

  if (!wallet) return

  return is.multisig(wallet)
    ? [toPostMultisig, toDelete, disconnectWallet]
    : is.ledger(wallet)
    ? [toSignMultisig, disconnectWallet]
    : [toExport, toPassword, toDelete, toSignMultisig, lockWallet]
}

export const ManageConnecting = () => {
  const { available } = useAuth()

  return (
    <>{!!available.length && <AuthList list={available} isModal={true} />}</>
  )
}

export const ManageConnected = () => {
  const list = useManageWallet()

  return <>{list && <AuthList list={list} isModal={true} />}</>
}
