import { useTranslation } from "react-i18next"
import { Card, Page } from "components/layout"
import SelectLedgerForm from "./SelectLedgerForm"

const SelectLedgerPage = () => {
  const { t } = useTranslation()

  return (
    <Page title={t("Access with ledger")} small>
      <Card>
        <SelectLedgerForm />
      </Card>
    </Page>
  )
}

export default SelectLedgerPage
