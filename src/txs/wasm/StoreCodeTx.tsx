import { useTranslation } from "react-i18next"
import { Page, Card } from "components/layout"
import StoreCodeForm from "./StoreCodeForm"

const StoreCodeTx = () => {
  const { t } = useTranslation()

  return (
    <Page title={t("Upload a wasm file")} small>
      <Card>
        <StoreCodeForm />
      </Card>
    </Page>
  )
}

export default StoreCodeTx
