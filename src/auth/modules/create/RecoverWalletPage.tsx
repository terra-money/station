import { useTranslation } from "react-i18next"
import { Card, Page } from "components/layout"
import RecoverWalletForm from "./RecoverWalletForm"

const RecoverWalletPage = () => {
  const { t } = useTranslation()

  return (
    <Page title={t("Recover wallet")} small>
      <Card>
        <RecoverWalletForm />
      </Card>
    </Page>
  )
}

export default RecoverWalletPage
