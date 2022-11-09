import { useTranslation } from "react-i18next"
import { useNetworkName } from "data/wallet"
import { Card, Page } from "components/layout"
import { Wrong } from "components/feedback"
import TxContext from "../TxContext"
import TFMSwapContext from "./TFMSwapContext"
import TFMSwapForm from "./TFMSwapForm"
import TFMPoweredBy from "./TFMPoweredBy"

// The sequence below is required before rendering the Swap form:
// 1. `TxContext` - Fetch gas prices through, like other forms.
// 2. `SwapContext` - Complete the network request related to swap.
// 3. `SwapSingleContext` - Complete the network request not related to multiple swap

const SwapTx = () => {
  const { t } = useTranslation()
  const networkName = useNetworkName()

  if (networkName === "testnet") {
    return (
      <Page title={t("Swap")} small>
        <Card>
          <Wrong>{t("Not supported")}</Wrong>
        </Card>
      </Page>
    )
  }

  return (
    <Page title={t("Swap")} small extra={<TFMPoweredBy />}>
      <TxContext>
        <TFMSwapContext>
          <TFMSwapForm />
        </TFMSwapContext>
      </TxContext>
    </Page>
  )
}

export default SwapTx
