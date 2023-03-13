import { useTranslation } from "react-i18next"
import { Page, Card, ChainFilter } from "components/layout"
import { Wrong } from "components/feedback"
import { ExternalLink } from "components/general"
import { useNetworkName } from "data/wallet"

// TODO
// - [ ]  Create new route for swap
//     - [ ]  provide all chains in chain selector
// - [ ]  Create new context based on selected chain
//     - [ ]  fetch tfm + rango available swaps for selected chain
//     - [ ]  fetch native denoms
//     - [ ]  fetch custom cw20s
//     - [ ]  filter native + custom through whitelists
//     - [ ]  fetch balances for native + custom
//     - [ ]  populate map of trades key’d by offer asset, track tfm or rango
// - [ ]  Create new form to receive context and chain info
//     - Render
//         - [ ]  input 1 (offer asset)
//             - [ ]  show assets with balance or ALL
//         - [ ]  input 2 (receive asset)
//             - [ ]  populated with trade lookup
//         - [ ]  slippage (text)
//         - [ ]  submit button
//     - Behavior
//         - [ ]  on input update, (assets or amount)
//             - [ ]  simulate trade for each network available
//                 - [ ]  pick trade with highest receive asset amount
//                 - [ ]  update “powered by” link based on swap network
//             - [ ]  if simulate is successful AND user has balance of gas denom
//                 - [ ]  allow submit
//         - [ ]  on submit
//             - [ ]  perform tx, process success or error
//     - UX
//         - [ ]  Provide option to get gas denom on error?
//             - [ ]  link out
//             - [ ]  fee abstraction
//                 - [ ]  swap for local(terra) ibc equiv and send?
//                 - [ ]  ibc-hooks

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
                <ExternalLink
                  icon={true}
                  href="https://tfm.com/terraclassic/trade/swap"
                >
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
    <Page title={t("Swap")} small>
      <ChainFilter outside>{(chainID) => <div>{chainID}</div>}</ChainFilter>
    </Page>
  )
}

export default SwapTx
