import { useTranslation } from "react-i18next"
import { Card, Page } from "components/layout"
import ConnectedWallet from "./ConnectedWallet"
import GoBack from "./GoBack"
import DeleteWalletForm from "./DeleteWalletForm"

const DeleteWalletPage = () => {
  const { t } = useTranslation()

  return (
    <Page title={t("Delete wallet")} extra={<GoBack />}>
      <ConnectedWallet>
        <Card>
          <DeleteWalletForm />
        </Card>
      </ConnectedWallet>
    </Page>
  )
}

export default DeleteWalletPage
