import { useTranslation } from "react-i18next"
import { Card, Page } from "components/layout"
import ConnectedWallet from "./ConnectedWallet"
import GoBack from "./GoBack"
import DeleteWalletForm from "./DeleteWalletForm"
import { isWallet } from "auth"

const DeleteWalletPage = () => {
  const { t } = useTranslation()

  return (
    <Page title={t("Delete wallet")} extra={!isWallet.mobile() && <GoBack />}>
      <ConnectedWallet>
        <Card>
          <DeleteWalletForm />
        </Card>
      </ConnectedWallet>
    </Page>
  )
}

export default DeleteWalletPage
