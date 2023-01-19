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
import { NavLink, useLocation, useNavigate } from "react-router-dom"
import classNames from "classnames"
import { AppBar, Toolbar, Typography } from "@mui/material"
import { ArrowBackIos } from "@mui/icons-material"

const App = () => {
  const { element: routes } = useNav()
  const { pathname } = useLocation()
  const showHeaderWhitePath = ["/faq"]
  const isShowHeader = showHeaderWhitePath.some((val) => val === pathname)
  const navigator = useNavigate()
  const goBack = () => {
    navigator(-1)
  }
  if(pathname.indexOf('/validator') === -1 && pathname.indexOf('/stake') === -1){
    localStorage.removeItem('stakeQuery')
  }
  return (
    <Layout>
      {!isShowHeader ? (
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
      ) : (
        <AppBar
          sx={{
            gridArea: "header",
            backgroundColor: "#333333",
            boxShadow: "none",
          }}
          position="static"
        >
          <Toolbar
            sx={{
              minHeight: 63,
            }}
          >
            <ArrowBackIos fontSize="small" onClick={goBack} />
            <Typography
              variant="h5"
              component="div"
              sx={{ flexGrow: 1, textAlign: "center", fontSize: 19 }}
            >
              FAQ
            </Typography>
          </Toolbar>
        </AppBar>
      )}

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
