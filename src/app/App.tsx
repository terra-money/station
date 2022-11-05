import { getErrorMessage } from "utils/error"
import Layout, { MainContainer, Page, Walletbar } from "components/layout"
import { Banner, Content, Header, Actions, Sidebar } from "components/layout"
import { ErrorBoundary, Wrong } from "components/feedback"

/* routes */
import { useNav } from "./routes"

/* banner */
import NetworkName from "./sections/NetworkName"

/* sidebar */
import Nav from "./sections/Nav"
import Aside from "./sections/Aside"

/* header */
import NetworkHeader from "./sections/NetworkHeader"
import Refresh from "./sections/Refresh"
import Preferences from "./sections/Preferences"
import SelectTheme from "./sections/SelectTheme"
import ConnectWallet from "./sections/ConnectWallet"

/* extra */
import LatestTx from "./sections/LatestTx"
import ValidatorButton from "./sections/ValidatorButton"
import DevTools from "./sections/DevTools"

/* init */
import InitBankBalance from "./InitBankBalance"
import Wallet from "pages/wallet/Wallet"

const App = () => {
  const { element: routes } = useNav()

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
        <NetworkHeader />

        <Actions>
          <DevTools />
          <section>
            <Refresh />
            <Preferences />
            <SelectTheme />
          </section>
          <ValidatorButton />
          <ConnectWallet />
        </Actions>
        <LatestTx />
      </Header>

      <Content>
        <ErrorBoundary fallback={fallback}>
          <InitBankBalance>
            <MainContainer>
              <Page>{routes}</Page>
              <Walletbar>
                <Wallet />
              </Walletbar>
            </MainContainer>
          </InitBankBalance>
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
