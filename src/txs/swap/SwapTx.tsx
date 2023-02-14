import { useTranslation } from "react-i18next"
import { useNetworkName } from "data/wallet"
import { Card, Page } from "components/layout"
import { Wrong } from "components/feedback"
import TFMPoweredBy from "./TFMPoweredBy"
import { ExternalLink } from "components/general"
import { SwapForm } from "./SwapForm"
import { MultichainSwapContext } from "./MultichainSwapContext"

// The sequence below is required before rendering the Swap form:
// 1. `SwapContext` - Complete the network request related to swap.
// 2. `SwapSingleContext` - Complete the network request not related to multiple swap

const SwapTx = () => {
  const { t } = useTranslation()
  const networkName = useNetworkName()

  if (networkName !== "mainnet") {
    return (
      <Page title={t("Swap")} small>
        <Card>
          <Wrong>
            {networkName === "classic" ? (
              <p>
                Swaps are not supported for classic, please use the{" "}
                <ExternalLink href="https://tfm.com/terraclassic/trade/swap">
                  TFM webapp
                </ExternalLink>{" "}
                instead.
              </p>
            ) : (
              t("Not supported")
            )}
          </Wrong>
        </Card>
      </Page>
    )
  }

  return (
    <Page title={t("Swap")} small extra={<TFMPoweredBy />}>
      <Card>
        <MultichainSwapContext>
          <SwapForm />
        </MultichainSwapContext>
      </Card>
    </Page>
  )
}

export default SwapTx
