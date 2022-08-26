import { useTranslation } from "react-i18next"
import { Page, Card } from "components/layout"
import TxContext from "../TxContext"
import TaxParamsContext from "./TaxParams"
import IBCHelperContext from "../IBCHelperContext"
import InstantiateContractForm from "./InstantiateContractForm"

const InstantiateContractTx = () => {
  const { t } = useTranslation()

  return (
    <Page title={t("Instantiate a code")} small>
      <Card>
        <TxContext>
          <IBCHelperContext>
            <TaxParamsContext>
              <InstantiateContractForm />
            </TaxParamsContext>
          </IBCHelperContext>
        </TxContext>
      </Card>
    </Page>
  )
}

export default InstantiateContractTx
