import { useTranslation } from "react-i18next"
import { Page, ChainFilter } from "components/layout"
import IBCHelperContext from "../IBCHelperContext"
import InstantiateContractForm from "./InstantiateContractForm"

const InstantiateContractTx = () => {
  const { t } = useTranslation()

  return (
    <Page title={t("Instantiate a code")} small backButtonPath="/contract">
      <ChainFilter>
        {(chainID) => (
          <IBCHelperContext>
            <InstantiateContractForm chainID={chainID ?? ""} />
          </IBCHelperContext>
        )}
      </ChainFilter>
    </Page>
  )
}

export default InstantiateContractTx
