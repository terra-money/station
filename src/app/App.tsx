import { getErrorMessage } from "utils/error"
import Layout, { MainContainer, Page } from "components/layout"
import { Banner, Content, Header, Actions, Sidebar } from "components/layout"
import { ErrorBoundary, Wrong } from "components/feedback"

/* routes */
import { useNav } from "./routes"

/* banner */
import UpdateExtension from "./sections/UpdateExtension"

/* sidebar */
import Nav from "./sections/Nav"
import Aside from "./sections/Aside"
import AsideBackground from "./components/AsideBackground"

/* header */
import NetworkHeader from "./sections/NetworkHeader"
import Refresh from "./sections/Refresh"
import Preferences from "./sections/Preferences"
import ConnectWallet from "./sections/ConnectWallet"
import ActionsBackground from "./components/ActionsBackground"
import NavBackgrounds from "./components/NavBackgrounds"

/* extra */
import LatestTx from "./sections/LatestTx"
import ValidatorButton from "./sections/ValidatorButton"
import DevTools from "./sections/DevTools"
import BackgroundBlobs from "components/layout/BackgroundBlobs"

/* init */
import InitBankBalance from "./InitBankBalance"
import Wallet from "pages/wallet/Wallet"
import NavButton from "./sections/NavButton"
import NetworkStatus from "components/display/NetworkStatus"
import EnableCoinType from "./sections/EnableCoinType"
import UpdateNotification from "./update/UpdateNotification"
import { useEffect } from "react"

const App = () => {
  const { element: routes } = useNav()

  useEffect(() => {
    // if the user is not coming from the desktop app
    if (!navigator.userAgent.includes("Electron")) {
      // redirect them to the new domain and keep the current path
      window.location.href = `https://dashboard.station.money${
        new URL(window.location.href).pathname
      }`
    }
  }, [])

  return (
    <InitBankBalance>
      <Layout>
        <Banner>
          <UpdateExtension />
        </Banner>

        <Sidebar>
          <Nav />
          <Aside />
          <AsideBackground />
        </Sidebar>

        <Header>
          <NavBackgrounds />
          <NetworkHeader />

          <Actions>
            <DevTools />
            <section>
              <Refresh />
              <Preferences />
              <NetworkStatus />
            </section>
            <ValidatorButton />
            <EnableCoinType />
            <ConnectWallet />
            <NavButton />
            <ActionsBackground />
          </Actions>
          <LatestTx />
        </Header>

        <Content>
          <ErrorBoundary fallback={fallback}>
            <MainContainer>
              <BackgroundBlobs />
              {routes}
              <Wallet />
            </MainContainer>
          </ErrorBoundary>
        </Content>
      </Layout>
      <UpdateNotification />
    </InitBankBalance>
  )
}

export default App

/* error */
export const fallback = (error: Error) => (
  <Page>
    <Wrong>{getErrorMessage(error)}</Wrong>
  </Page>
)
