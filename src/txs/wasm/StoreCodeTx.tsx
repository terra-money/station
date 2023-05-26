import { useTranslation } from "react-i18next"
import { Page, ChainFilter } from "components/layout"
import StoreCodeForm from "./StoreCodeForm"

const StoreCodeTx = () => {
  const { t } = useTranslation()

  return (
    <Page title={t("Upload a wasm file")} small backButtonPath="/contract">
      <ChainFilter>
        {(chainID) => <StoreCodeForm chainID={chainID ?? ""} />}
      </ChainFilter>
    </Page>
  )
}

export default StoreCodeTx
