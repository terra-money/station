import { useTranslation } from "react-i18next"
import { Card, Page } from "components/layout"
import ConnectedWallet from "./ConnectedWallet"
import GoBack from "./GoBack"
import ExportWalletForm from "./ExportWalletForm"
import { isWallet } from "auth"

const ExportWalletPage = () => {
  const { t } = useTranslation()

  return (
    <Page title={t("Export wallet")} extra={!isWallet.mobile() && <GoBack />}>
      <ConnectedWallet>
        <Card>
          <ExportWalletForm />
        </Card>
      </ConnectedWallet>
    </Page>
  )
}

export default ExportWalletPage
