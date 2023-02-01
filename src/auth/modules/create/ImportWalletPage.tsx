import { useTranslation } from "react-i18next"
import { Card, Page } from "components/layout"
import ImportWalletForm from "./ImportWalletForm"

const ImportWalletPage = () => {
  const { t } = useTranslation()

  return (
    <Page title={t("Import from private key")} small>
      <Card>
        <ImportWalletForm />
      </Card>
    </Page>
  )
}

export default ImportWalletPage
