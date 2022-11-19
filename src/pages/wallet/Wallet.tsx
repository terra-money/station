import styles from "./Wallet.module.scss"
import { ReactComponent as CloseIcon } from "styles/images/icons/WalletCloseArrow.svg"
import NetWorth from "./NetWorth"
import AssetList from "./AssetList"
import { useState } from "react"
import createContext from "utils/createContext"
import AssetPage from "./AssetPage"
import ReceivePage from "./ReceivePage"
import SendPage from "./SendPage"

enum Path {
  wallet = "wallet",
  coin = "coin",
  receive = "receive",
  send = "send",
}

type Route =
  | {
      path: Path.wallet
    }
  | {
      path: Path.coin
      denom: string
      previusPage: Route
    }
  | {
      path: Path.receive
      previusPage: Route
    }
  | {
      path: Path.send
      denom?: string
      previusPage: Route
    }

// Handle routing inside Wallet
const [useWalletRoute, WalletRouter] = createContext<{
  route: Route
  setRoute: (route: Route) => void
}>("useWalletRoute")

export { useWalletRoute, Path }

const Wallet = () => {
  const [isOpen, setIsOpen] = useState(true)
  const [route, setRoute] = useState<Route>({ path: Path.wallet })

  function BackButton() {
    if (route.path === Path.wallet) return null

    return (
      <button
        className={styles.back}
        onClick={() => setRoute(route.previusPage)}
      >
        <CloseIcon width={18} height={18} />
      </button>
    )
  }

  function render() {
    switch (route.path) {
      case Path.wallet:
        return (
          <>
            <NetWorth />
            <AssetList />
          </>
        )
      case Path.coin:
        return (
          <>
            <BackButton />
            <AssetPage />
          </>
        )
      case Path.receive:
        return (
          <>
            <BackButton />
            <ReceivePage />
          </>
        )
      case Path.send:
        return (
          <>
            <BackButton />
            <SendPage />
          </>
        )
    }
  }

  return (
    <div className={`${styles.wallet} ${!isOpen && styles.wallet__closed}`}>
      <button
        className={styles.close}
        onClick={() => {
          setIsOpen((o) => !o)
        }}
      >
        <CloseIcon width={18} height={18} />
      </button>
      <WalletRouter value={{ route, setRoute }}>{render()}</WalletRouter>
    </div>
  )
}

export default Wallet
