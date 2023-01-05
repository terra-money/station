import { useTranslation } from "react-i18next"
import { Page, Card } from "components/layout"
import IBCHelperContext from "../IBCHelperContext"
import InstantiateContractForm from "./InstantiateContractForm"

const InstantiateContractTx = () => {
  const { t } = useTranslation()

  return (
    <Page title={t("Instantiate a code")} small>
      <Card>
        <IBCHelperContext>
          <InstantiateContractForm />
        </IBCHelperContext>
      </Card>
    </Page>
  )
}

export default InstantiateContractTx
