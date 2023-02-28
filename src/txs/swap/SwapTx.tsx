import { useTranslation } from "react-i18next"
import { Page } from "components/layout"
import TFMPoweredBy from "./TFMPoweredBy"
import { SwapChainsContext } from "./SwapChainsContext"
import { SwapPageContent } from "./SwapPageContent"

// The sequence below is required before rendering the Swap form:
// 1. `SwapContext` - Complete the network request related to swap.
// 2. `SwapSingleContext` - Complete the network request not related to multiple swap

const SwapTx = () => {
  const { t } = useTranslation()

  return (
    <Page title={t("Swap")} small extra={<TFMPoweredBy />}>
      <SwapChainsContext>
        <SwapPageContent />
      </SwapChainsContext>
    </Page>
  )
}

export default SwapTx
