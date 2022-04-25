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
import WalletConnect from "./sections/WalletConnect"
import ConnectWallet from "./sections/ConnectWallet"
// import QRScan from "./sections/QRScan"
// import Bio from "./sections/Bio"

/* extra */
import LatestTx from "./sections/LatestTx"
import ValidatorButton from "./sections/ValidatorButton"
import DevTools from "./sections/DevTools"
import { RN_APIS, getWallets, recoverSessions } from "../utils/rnModule"

/* init */
import InitBankBalance from "./InitBankBalance"
import { useLayoutEffect } from "react"
import {
  getStoredWallets,
  getWallet,
  storeWallets,
} from "../auth/scripts/keystore"
import { useNavigate } from "react-router-dom"

const App = () => {
  const { element: routes } = useNav()
  const navigate = useNavigate()

  const RNListener = () => {
    const listener = async (event: any) => {
      if (event.data.includes("setImmediate$0")) return

      const { data, type } = JSON.parse(event.data)

      console.log("Webview", type, data)
      if (type === RN_APIS.DEEPLINK && data?.payload !== "null") {
        navigate("/confirm", {
          replace: true,
          state: data,
        })
      }
    }

    if (window.ReactNativeWebView) {
      /** android */
      document.addEventListener("message", listener)
      /** ios */
      window.addEventListener("message", listener)
    }
  }

  useLayoutEffect(() => {
    if (window.ReactNativeWebView) {
      RNListener()

      getWallets().then((res: any) => {
        console.log(res)
        const wallets = getStoredWallets()
        const walletAddresses = wallets.map((item) => item.address)

        const rnWallets = res
          ?.filter((item: Wallet) => {
            if (walletAddresses.includes(item.address)) return false
            else return true
          })
          .map((item: RNWallet) => ({
            name: item.name,
            address: item.address,
            encrypted: item.encryptedKey,
          }))

        // console.log(rnWallets)
        if (rnWallets?.length) {
          storeWallets([...wallets, ...rnWallets])
        }
      })

      const wallet = getWallet()
      if (wallet) {
        console.log("wallet", wallet)
        recoverSessions(wallet?.address)
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
        <section>
          <Refresh />
          <Preferences />
          <SelectTheme />
          <WalletConnect />
          {/*<QRScan />*/}
        </section>
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
