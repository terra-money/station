import { useTranslation } from "react-i18next"
import { useIsClassic } from "data/query"
import { useNetworkName } from "data/wallet"
import { LinkButton } from "components/general"
import { Card, Page } from "components/layout"
import { Wrong } from "components/feedback"
import TxContext from "../TxContext"
import SwapContext from "./SwapContext"
import SingleSwapContext from "./SingleSwapContext"
import SwapForm from "./SwapForm"
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
  const isClassic = useIsClassic()

  const extra = (
    <LinkButton to="/swap/multiple" size="small">
      {t("Swap multiple coins")}
    </LinkButton>
  )

  if (networkName === "testnet") {
    return (
      <Page title={t("Swap")} small>
        <Card>
          <Wrong>{t("Not supported")}</Wrong>
        </Card>
      </Page>
    )
  }

  if (!isClassic)
    return (
      <Page title={t("Swap")} small extra={<TFMPoweredBy />}>
        <TxContext>
          <TFMSwapContext>
            <TFMSwapForm />
          </TFMSwapContext>
        </TxContext>
      </Page>
    )

  return (
    <Page title={t("Swap")} small extra={extra}>
      <TxContext>
        <SwapContext>
          <SingleSwapContext>
            <SwapForm />
          </SingleSwapContext>
        </SwapContext>
      </TxContext>
    </Page>
  )
}

export default SwapTx
