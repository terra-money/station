import { useTranslation } from "react-i18next"
import { Card, Page } from "components/layout"
import ImportWalletForm from "./ImportWalletForm"
import GoBack from "../manage/GoBack"

const ImportWalletPage = () => {
  const { t } = useTranslation()

  return (
    <Page title={t("Import from private key")} extra={<GoBack />} small>
      <Card>
        <ImportWalletForm />
      </Card>
    </Page>
  )
}

export default ImportWalletPage
