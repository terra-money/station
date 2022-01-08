import { useTranslation } from "react-i18next"
import { Card, Page } from "components/layout"
import AccessWithLedgerForm from "./AccessWithLedgerForm"

const AccessWithLedgerPage = () => {
  const { t } = useTranslation()

  return (
    <Page title={t("Access with ledger")} small>
      <Card>
        <AccessWithLedgerForm />
      </Card>
    </Page>
  )
}

export default AccessWithLedgerPage
