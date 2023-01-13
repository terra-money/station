import { useTranslation } from "react-i18next"
import { Page, Card } from "components/layout"
import IBCHelperContext from "../IBCHelperContext"
import ExecuteContractForm from "./ExecuteContractForm"

const ExecuteContractTx = () => {
  const { t } = useTranslation()

  return (
    <Page title={t("Execute")} small>
      <Card>
        <IBCHelperContext>
          <ExecuteContractForm />
        </IBCHelperContext>
      </Card>
    </Page>
  )
}

export default ExecuteContractTx
