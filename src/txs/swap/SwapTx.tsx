import { useTranslation } from "react-i18next"
import { useNetworkName } from "data/wallet"
import { Card, ChainFilter, Page } from "components/layout"
import { Wrong } from "components/feedback"
import TFMSwapContext from "./TFMSwapContext"
import TFMSwapForm from "./TFMSwapForm"
import TFMPoweredBy from "./TFMPoweredBy"
import { ExternalLink } from "components/general"
import PageBanner from "app/sections/PageBanner"
import { useEffect, useState } from "react"

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

  const AnnouncementBanner = () => {
    const [isClosed, setIsClosed] = useState(false)

    useEffect(() => {
      const closedStorage = localStorage.getItem("v3BannerClosed")
      if (closedStorage) setIsClosed(true)
    }, [])

    if (isClosed) return null

    const handleClose = () => {
      localStorage.setItem("v3BannerClosed", "true")
      setIsClosed(true)
    }

    return (
      <PageBanner
        title="For Desktop app users, please migrate to Station Extension before Dec 31, 2024"
        buttonHref="https://swgee.medium.com/c371a280b244"
        onClose={handleClose}
      />
    )
  }

  return (
    <Page
      title={t("Swap")}
      small
      extra={<TFMPoweredBy />}
      banner={AnnouncementBanner()}
    >
      <TFMSwapContext>
        <ChainFilter
          outside
          title={"Select a chain to perform swaps on"}
          terraOnly
        >
          {(chainID) => <TFMSwapForm chainID={chainID ?? ""} />}
        </ChainFilter>
      </TFMSwapContext>
    </Page>
  )
}

export default SwapTx
