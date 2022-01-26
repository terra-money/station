import { StrictMode } from "react"
import { render } from "react-dom"
import { BrowserRouter } from "react-router-dom"
import { ReactQueryDevtools } from "react-query/devtools"
import { RecoilRoot } from "recoil"
import { getChainOptions, WalletProvider } from "@terra-money/wallet-provider"
import "tippy.js/dist/tippy.css"

import "config/lang"
import { BRIDGE } from "config/constants"
import { debug } from "utils/env"

import "index.scss"
import ScrollToTop from "app/ScrollToTop"
import InitNetworks from "app/InitNetworks"
import InitWallet from "app/InitWallet"
import InitTheme from "app/InitTheme"
import ElectronVersion from "app/ElectronVersion"
import App from "app/App"

const connectorOpts = { bridge: BRIDGE }

getChainOptions().then((chainOptions) =>
  render(
    <StrictMode>
      <RecoilRoot>
        <BrowserRouter>
          <ScrollToTop />
          <WalletProvider {...chainOptions} connectorOpts={connectorOpts}>
            <InitNetworks>
              <InitWallet>
                <InitTheme />
                <ElectronVersion />
                <App />
              </InitWallet>
            </InitNetworks>
          </WalletProvider>
          {debug.query && <ReactQueryDevtools position="bottom-right" />}
        </BrowserRouter>
      </RecoilRoot>
    </StrictMode>,
    document.getElementById("station")
  )
)
