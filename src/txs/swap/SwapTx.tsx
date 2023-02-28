import { useTranslation } from "react-i18next"
import { Page } from "components/layout"
import TFMPoweredBy from "./TFMPoweredBy"
import { SwapPageContent } from "./SwapPageContent"
import { SwapProvidersContext } from "./SwapProvidersContext"

const SwapTx = () => {
  const { t } = useTranslation()

  return (
    <Page title={t("Swap")} small extra={<TFMPoweredBy />}>
      <SwapProvidersContext>
        <SwapPageContent />
      </SwapProvidersContext>
    </Page>
  )
}

export default SwapTx
