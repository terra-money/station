import { AccAddress } from "@terra-money/terra.js"
import { getErrorMessage } from "utils/error"
import Layout, { Page } from "components/layout"
import { Banner, Content, Header, Actions, Sidebar } from "components/layout"
import { ErrorBoundary, Wrong } from "components/feedback"
import { useNavigate } from "react-router-dom"
import is from "../auth/scripts/is"

/* routes */
import { useNav } from "./routes"

/* banner */
import NetworkName from "./sections/NetworkName"

/* sidebar */
import Nav from "./sections/Nav"
import Aside from "./sections/Aside"

/* header */
import IsClassicNetwork from "./sections/IsClassicNetwork"
import Refresh from "./sections/Refresh"
import Preferences from "./sections/Preferences"
import SelectTheme from "./sections/SelectTheme"
import ConnectWallet from "./sections/ConnectWallet"
import QRScan from "./sections/QRScan"
import Bio from "./sections/Bio"

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
import WalletConnect from "../pages/wallet/WalletConnect"
import { disconnectSession } from "../auth/scripts/sessions"

const App = () => {
  const { element: routes } = useNav()
  const navigate = useNavigate()

  const RNListener = () => {
    const listener = async (event: any) => {
      if (event.data.includes("setImmediate$0")) return

      const { data, type } = JSON.parse(event.data)
      switch (type) {
        case RN_APIS.DEEPLINK: {
          if (data?.action === "wallet_connect") {
            navigate("/connect", {
              replace: true,
              state: data,
            })
          } else if (data?.action !== "wallet_connect") {
            navigate("/confirm", {
              replace: true,
              state: data,
            })
          }
          // }
          break
        }
        case RN_APIS.DISCONNECT_SESSIONS: {
          if (typeof data === "string") {
            disconnectSession(data)
          }
          break
        }
        case RN_APIS.QR_SCAN: {
          if (AccAddress.validate(data)) {
            // send
            navigate("/send/select", {
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
    if (is.mobileNative()) {
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
        <IsClassicNetwork />

        <Actions>
          <DevTools />
          <section>
            {!is.mobile() && (
              <>
                <Refresh />
                <Preferences />
                <SelectTheme />
              </>
            )}
          </section>
          <ValidatorButton />
          <ConnectWallet />
        </Actions>
        {!is.mobile() && <LatestTx />}
      </Header>

      <Content>
        <ErrorBoundary fallback={fallback}>
          <InitBankBalance>{routes}</InitBankBalance>
        </ErrorBoundary>
      </Content>
      {is.mobile() && <LatestTx />}
      <WalletConnect />
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
