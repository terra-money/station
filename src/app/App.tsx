import { AccAddress } from "@terra-money/terra.js"
import { getErrorMessage } from "utils/error"
import Layout from "components/layout"
import { Banner, Content, Header, Sidebar, Page } from "components/layout"
import { ErrorBoundary, Wrong } from "components/feedback"

/* routes */
import { useNav } from "./routes"

/* banner */
import NetworkName from "./sections/NetworkName"

/* sidebar */
import Nav from "./sections/Nav"
import Aside from "./sections/Aside"

/* header */
import Refresh from "./sections/Refresh"
import Preferences from "./sections/Preferences"
import SelectTheme from "./sections/SelectTheme"
import ConnectWallet from "./sections/ConnectWallet"

/* extra */
import LatestTx from "./sections/LatestTx"
import ValidatorButton from "./sections/ValidatorButton"
import DevTools from "./sections/DevTools"
import {
  RN_APIS,
  getWallets,
  recoverSessions,
  schemeUrl,
} from "../utils/rnModule"

/* init */
import InitBankBalance from "./InitBankBalance"
import { useLayoutEffect } from "react"
import {
  getStoredWallets,
  getWallet,
  storeWallets,
} from "../auth/scripts/keystore"
import { useNavigate } from "react-router-dom"
import is from "../auth/scripts/is"

const App = () => {
  const { element: routes } = useNav()
  const navigate = useNavigate()

  const RNListener = () => {
    const listener = async (event: any) => {
      if (event.data.includes("setImmediate$0")) return

      const { data, type } = JSON.parse(event.data)
      console.log("Webview", type, data)
      switch (type) {
        case RN_APIS.DEEPLINK: {
          if (data?.payload !== "null") {
            navigate("/confirm", {
              replace: true,
              state: data,
            })
          }
          break
        }
        case RN_APIS.QR_SCAN: {
          console.log("onlyIfScan", AccAddress.validate(data))
          if (AccAddress.validate(data)) {
            // send
            navigate("/send", {
              replace: true,
              state: data,
            })
          }
          if (schemeUrl.recoverWallet.test(data)) {
            // recover
            const url = new URL(data)
            const payload = url.searchParams.get("payload")

            navigate("/auth/import", {
              replace: true,
              state: payload,
            })
          }
          break
        }
        default:
          break
      }
    }

    /** android */
    document.addEventListener("message", listener)
    /** ios */
    window.addEventListener("message", listener)
  }

  useLayoutEffect(() => {
    if (is.mobile()) {
      RNListener()

      getWallets().then((res: any) => {
        const wallets = getStoredWallets()
        const walletAddresses = wallets.map((item) => item.address)

        const rnWallets = res
          ?.filter((item: Wallet) => {
            if (walletAddresses.includes(item.address)) return false
            else return true
          })
          .map((item: RNWallet) => {
            console.log(item)
            if (item?.ledger) {
              return {
                name: item.name,
                address: item.address,
                ledger: item.ledger,
                index: item.path,
              }
            } else {
              return {
                name: item.name,
                address: item.address,
                encrypted: item.encryptedKey,
              }
            }
          })

        console.log(rnWallets)
        if (rnWallets?.length) {
          storeWallets([...wallets, ...rnWallets])
        }
      })

      const wallet = getWallet()
      if (wallet) {
        recoverSessions()
      }
    }
  }, [])

  return (
    <Layout>
      <Banner>
        <NetworkName />
      </Banner>

      <Sidebar>
        <Nav />
        <Aside />
      </Sidebar>

      <Header>
        <DevTools />
        {!is.mobile() && (
          <section>
            <Refresh />
            <Preferences />
            <SelectTheme />
          </section>
        )}
        <ValidatorButton />
        <ConnectWallet />
        <LatestTx />
      </Header>

      <Content>
        <ErrorBoundary fallback={fallback}>
          <InitBankBalance>{routes}</InitBankBalance>
        </ErrorBoundary>
      </Content>
    </Layout>
  )
}

export default App

/* error */
export const fallback = (error: Error) => (
  <Page>
    <Wrong>{getErrorMessage(error)}</Wrong>
  </Page>
)
