import { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import QrCodeIcon from "@mui/icons-material/QrCode"
import PasswordIcon from "@mui/icons-material/Password"
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline"
import LogoutIcon from "@mui/icons-material/Logout"
import { Col, Page } from "components/layout"
import useAuth from "../../hooks/useAuth"
import ConnectedWallet from "./ConnectedWallet"
import styles from "./ManageWallets.module.scss"

const ManageWallets = () => {
  const { t } = useTranslation()
  const { wallet, available } = useAuth()

  const list = [
    {
      to: "./export",
      children: t("Export wallet"),
      icon: <QrCodeIcon />,
    },
    {
      to: "./password",
      children: t("Change password"),
      icon: <PasswordIcon />,
    },
    {
      to: "./delete",
      children: t("Delete wallet"),
      icon: <DeleteOutlineIcon />,
    },
    {
      to: "./disconnect",
      children: t("Disconnect"),
      icon: <LogoutIcon />,
    },
  ]

  interface Item {
    to: string
    children: string
    icon: ReactNode
  }

  const renderItem = ({ to, children, icon }: Item) => {
    return (
      <Link to={to} className={styles.link} key={to}>
        {children}
        {icon}
      </Link>
    )
  }

  return (
    <Page title={t("Manage wallets")}>
      <Col>
        <ConnectedWallet>
          {wallet && <div className={styles.list}>{list.map(renderItem)}</div>}

          {!!available.length && (
            <div className={styles.list}>{available.map(renderItem)}</div>
          )}
        </ConnectedWallet>
      </Col>
    </Page>
  )
}
export default ManageWallets
