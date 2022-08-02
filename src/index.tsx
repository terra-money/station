/*
 * @Author: lmk
 * @Date: 2022-06-02 16:12:07
 * @LastEditTime: 2022-08-02 17:14:56
 * @LastEditors: lmk
 * @Description:
 */
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { ReactQueryDevtools } from "react-query/devtools"
import { RecoilRoot } from "recoil"
import { WalletProvider } from "@terra-money/wallet-provider"
import "tippy.js/dist/tippy.css"

import "config/lang"
import { BRIDGE } from "config/constants"
import { debug } from "utils/env"

import "index.scss"
import ScrollToTop from "app/ScrollToTop"
import InitNetworks from "app/InitNetworks"
import InitWallet from "app/InitWallet"
// import InitTheme from "app/InitTheme"
import ElectronVersion from "app/ElectronVersion"
import App from "app/App"
import { ThemeProvider, createTheme } from "@mui/material/styles"
const connectorOpts = { bridge: BRIDGE }

const root = createRoot(document.getElementById("station") as HTMLElement)

//getChainOptions().then((chainOptions) =>
const chainOptions = {
  defaultNetwork: {
    name: "mainnet",
    chainID: "mainnet",
    lcd: "https://rest.gw.mises.site",
  },
  walletConnectChainIds: [],
}
const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#5c5fff",
    },
  },
  shape: {
    borderRadius: 50,
  },
})
root.render(
  <StrictMode>
    <RecoilRoot>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <ScrollToTop />
          <WalletProvider {...chainOptions} connectorOpts={connectorOpts}>
            <InitNetworks>
              <InitWallet>
                {/* <InitTheme /> */}
                <ElectronVersion />
                <App />
              </InitWallet>
            </InitNetworks>
          </WalletProvider>
          {debug.query && <ReactQueryDevtools position="bottom-right" />}
        </BrowserRouter>
      </ThemeProvider>
    </RecoilRoot>
  </StrictMode>
)
//)
