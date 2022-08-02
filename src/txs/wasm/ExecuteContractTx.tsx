import { useTranslation } from "react-i18next"
import { Page, Card } from "components/layout"
import TxContext from "../TxContext"
import IBCHelperContext from "../IBCHelperContext"
import ExecuteContractForm from "./ExecuteContractForm"

const ExecuteContractTx = () => {
  const { t } = useTranslation()

  return (
    <Page title={t("Execute")} small>
      <Card>
        <TxContext>
          <IBCHelperContext>
            <ExecuteContractForm />
          </IBCHelperContext>
        </TxContext>
      </Card>
    </Page>
  )
}

export default ExecuteContractTx
