import { getErrorMessage } from "utils/error"
import Layout from "components/layout"
import { Content, Header, Page } from "components/layout"
import { ErrorBoundary, Wrong } from "components/feedback"
import styles from "./sections/Nav.module.scss"

/* routes */
import { useNav } from "./routes"

/* banner */
// import NetworkName from "./sections/NetworkName"

// /* sidebar */
// import Nav from "./sections/Nav"
// import Aside from "./sections/Aside"

/* header */
import Refresh from "./sections/Refresh"
// import Preferences from "./sections/Preferences"
// import SelectTheme from "./sections/SelectTheme"
import ConnectWallet from "./sections/ConnectWallet"

/* extra */
import LatestTx from "./sections/LatestTx"
import ValidatorButton from "./sections/ValidatorButton"
// import DevTools from "./sections/DevTools"

/* init */
import InitBankBalance from "./InitBankBalance"
import { NavLink } from "react-router-dom"
import classNames from "classnames"

const App = () => {
  const { element: routes } = useNav()

  return (
    <Layout>
      {/* <Banner>
        <NetworkName />
      </Banner> */}

      {/* <Sidebar>
        <Nav />
        <Aside />
      </Sidebar> */}

      <Header>
        <NavLink to="/" className={classNames(styles.item, styles.logo)}>
          <strong>Mises</strong> Portal
        </NavLink>
        {/* <DevTools /> */}
        <section>
          <Refresh />
          {/* <Preferences /> */}
          {/* <SelectTheme /> */}
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
