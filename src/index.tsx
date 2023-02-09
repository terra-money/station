/*
 * @Author: lmk
 * @Date: 2022-06-02 16:12:07
 * @LastEditTime: 2022-08-22 16:35:30
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
// import ElectronVersion from "app/ElectronVersion"
import App from "app/App"
import { ThemeProvider, createTheme } from "@mui/material/styles"

import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";
import { getAnalytics, logEvent } from "firebase/analytics"
import { initializeApp } from "firebase/app"

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

const firebaseConfig = {
  apiKey: "AIzaSyA15UjL8TFIHLWUk-S83KeuLRC_D7hvwUU",
  authDomain: "mises-official-site.firebaseapp.com",
  projectId: "mises-official-site",
  storageBucket: "mises-official-site.appspot.com",
  messagingSenderId: "235777024442",
  appId: "1:235777024442:web:da94196c84a941fab07d83",
  measurementId: "G-Y5Y02HDCC8",
};
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

Sentry.init({
  enabled: process.env.REACT_APP_NODE_ENV==='production',
  dsn:
    "https://904bbe6a902b44279a758d334465d116@o1162849.ingest.sentry.io/4504648930295808",
  integrations: [new BrowserTracing()],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
  ignoreErrors:['UnhandledRejection'],
  // beforeSend: (event, hint) => {
  //   if (hint.originalException?.toString() === "Error: Failed to fetch") {
  //     logEvent(analytics, "staking_error", {
  //       error_message: hint.originalException?.toString(),
  //     });

  //     return null;
  //   }
  //   console.log(event);
  //   return event;
  // },
});

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
                {/* <ElectronVersion /> */}
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
