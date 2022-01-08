import { useTranslation } from "react-i18next"
import { Card, Page } from "components/layout"
import ConnectedWallet from "./ConnectedWallet"
import GoBack from "./GoBack"
import ExportWalletForm from "./ExportWalletForm"

const ExportWalletPage = () => {
  const { t } = useTranslation()

  return (
    <Page title={t("Export wallet")} extra={<GoBack />}>
      <ConnectedWallet>
        <Card>
          <ExportWalletForm />
        </Card>
      </ConnectedWallet>
    </Page>
  )
}

export default ExportWalletPage
