import { useTranslation } from "react-i18next"
import { Card, Page } from "components/layout"
import RecoverWalletForm from "./RecoverWalletForm"

const RecoverWalletPage = () => {
  const { t } = useTranslation()

  return (
    <Page title={t("Import from seed phrase")} backButtonPath="/" small>
      <Card>
        <RecoverWalletForm />
      </Card>
    </Page>
  )
}

export default RecoverWalletPage
