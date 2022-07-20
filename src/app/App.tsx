import { AccAddress } from "@terra-money/terra.js"
import { getErrorMessage } from "utils/error"
import Layout, { Page } from "components/layout"
import { Banner, Content, Header, Actions, Sidebar } from "components/layout"
import { ErrorBoundary, Wrong } from "components/feedback"
import { useNavigate } from "react-router-dom"
import { isWallet } from "auth"

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
import { useCallback, useEffect } from "react"
import {
  getStoredWallets,
  getWallet,
  storeWallets,
} from "../auth/scripts/keystore"
import { useSessionsState } from "../auth/hooks/useSessions"
import WalletConnect from "../pages/wallet/WalletConnect"

import { ToastContainer, Flip, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { validWalletConnectPayload, parseDynamicLinkURL } from "../utils/data"

const App = () => {
  const { element: routes } = useNav()
  const navigate = useNavigate()
  const [, disconnectSession] = useSessionsState()

  const RNListener = useCallback(() => {
    const listener = async (event: any) => {
      if (event?.data.includes("setImmediate$0")) return

      const { data, type } = JSON.parse(event?.data)
      switch (type) {
        case RN_APIS.DEEPLINK: {
          switch (data?.action) {
            case "wallet_connect":
              navigate("/connect", {
                state: data,
              })
              break
            case "walletconnect_connect": {
              const valid = await validWalletConnectPayload(data?.payload)
              if (valid.success) {
                navigate("/connect", {
                  state: {
                    action: "wallet_connect",
                    payload: valid.params?.uri,
                  },
                })
              } else {
                toast.error(valid.errorMessage, {
                  toastId: "link-connect-error",
                })
              }
              break
            }
            default:
              navigate("/confirm", {
                state: data,
              })
              break
          }
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
            return navigate("/send/select", {
              state: data,
            })
          }
          if (schemeUrl.recoverWallet.test(data)) {
            // recover
            const url = new URL(data)
            const payload = url.searchParams.get("payload")

            return navigate("/auth/import", {
              state: payload,
            })
          }
          if (schemeUrl.connectWallet.test(data)) {
            // wallet connect
            const linkUrl = parseDynamicLinkURL(data)

            if (linkUrl) {
              const action = linkUrl?.searchParams.get("action")
              const payload = linkUrl?.searchParams.get("payload")
              return navigate("/connect", {
                state: {
                  action,
                  payload,
                },
              })
            }
          }

          toast.error("Not a valid QR code.", {
            toastId: "qr-code-error",
          })
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
  }, [disconnectSession])

  useEffect(() => {
    if (isWallet.mobileNative()) {
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

      // for initial landing
      navigate("/wallet", { replace: true })
    }
  }, [])

  return (
    <Layout>
      <Banner>{!isWallet.mobileNative() && <NetworkName />}</Banner>

      <Sidebar>
        <Nav />
        <Aside />
      </Sidebar>

      <Header>
        {!isWallet.mobile() && <IsClassicNetwork />}

        <Actions>
          <DevTools />
          <section>
            {!isWallet.mobile() && (
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
        {!isWallet.mobile() && <LatestTx />}
      </Header>

      <Content>
        <ErrorBoundary fallback={fallback}>
          <InitBankBalance>{routes}</InitBankBalance>
        </ErrorBoundary>
      </Content>

      {isWallet.mobile() && (
        <>
          <LatestTx />
          <ToastContainer
            limit={1}
            position="top-right"
            autoClose={2000}
            hideProgressBar
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
            transition={Flip}
          />
          <WalletConnect />
        </>
      )}
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
