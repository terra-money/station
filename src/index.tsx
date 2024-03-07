import { StrictMode } from "react"
import { render } from "react-dom"
import { BrowserRouter } from "react-router-dom"
import { ReactQueryDevtools } from "react-query/devtools"
import { RecoilRoot } from "recoil"
import { WalletProvider, getInitialConfig } from "@terra-money/wallet-kit"
import TerraStationMobileWallet from "@terra-money/terra-station-mobile"
import "tippy.js/dist/tippy.css"
import { initAnalytics } from "utils/analytics"
// import "station-ui/dist/style.css"

import "config/lang"
import { debug } from "utils/env"

import "index.scss"
import ScrollToTop from "app/ScrollToTop"
import InitNetworks from "app/InitNetworks"
import InitWallet from "app/InitWallet"
import InitTheme from "app/InitTheme"
import ElectronVersion from "app/ElectronVersion"
import App from "app/App"
import InitChains from "app/InitChains"
import WithNodeInfo from "app/WithNodeInfo"
import InitQueryClient from "app/InitQueryClient"

initAnalytics()

// if the user is not coming from the desktop app and is visiting the webpage from a large screen
if (!navigator.userAgent.includes("Electron") && window.innerWidth > 992) {
  // redirect them to the new domain and keep the current path
  /*
  window.location.href = `https://dashboard.station.money${
    new URL(window.location.href).pathname
  }`
  */
}

getInitialConfig().then((defaultNetworks) =>
  render(
    <StrictMode>
      <RecoilRoot>
        <BrowserRouter>
          <ScrollToTop />
          <WalletProvider
            defaultNetworks={defaultNetworks}
            extraWallets={[new TerraStationMobileWallet()]}
          >
            <InitQueryClient>
              <InitNetworks>
                <WithNodeInfo>
                  <InitChains>
                    <InitWallet>
                      <InitTheme />
                      <ElectronVersion />
                      <App />
                    </InitWallet>
                  </InitChains>
                </WithNodeInfo>
              </InitNetworks>
            </InitQueryClient>
          </WalletProvider>
          {debug.query && <ReactQueryDevtools position="bottom-right" />}
        </BrowserRouter>
      </RecoilRoot>
    </StrictMode>,
    document.getElementById("station")
  )
)
