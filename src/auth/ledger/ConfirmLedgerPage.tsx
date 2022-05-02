import { useTranslation } from "react-i18next"
import { Card, Page } from "components/layout"
import ConfirmLedgerForm from "./ConfirmLedgerForm"

const ConfirmLedgerPage = () => {
  const { t } = useTranslation()

  return (
    <Page title={t("Access with ledger")} small>
      <Card>
        <ConfirmLedgerForm />
      </Card>
    </Page>
  )
}

export default ConfirmLedgerPage
