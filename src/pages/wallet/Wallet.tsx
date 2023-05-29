import styles from "./Wallet.module.scss"
import { ReactComponent as WalletCloseIcon } from "styles/images/icons/WalletCloseArrow.svg"
import CloseIcon from "@mui/icons-material/Close"
import { ReactComponent as BackIcon } from "styles/images/icons/BackButton.svg"
import { ReactComponent as WalletIcon } from "styles/images/menu/Wallet.svg"
import NetWorth from "./NetWorth"
import AssetList from "./AssetList"
import createContext from "utils/createContext"
import AssetPage from "./AssetPage"
import ReceivePage from "./ReceivePage"
import SendPage from "./SendPage"
import { atom, useRecoilState } from "recoil"
import { useEffect } from "react"

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
      previousPage: Route
    }
  | {
      path: Path.receive
      previousPage: Route
    }
  | {
      path: Path.send
      denom?: string
      previousPage: Route
    }

// Handle routing inside Wallet
const [useWalletRoute, WalletRouter] = createContext<{
  route: Route
  setRoute: (route: Route) => void
}>("useWalletRoute")

export { useWalletRoute, Path }

export const isWalletBarOpen = atom({
  key: "isWalletBarOpen",
  default: false,
})

export const walletBarRoute = atom({
  key: "walletBarRoute",
  default: { path: Path.wallet } as Route,
})

const Wallet = () => {
  const [isOpen, setIsOpen] = useRecoilState(isWalletBarOpen)
  const [route, setRoute] = useRecoilState(walletBarRoute)

  useEffect(() => {
    if (document.body.clientWidth > 992) {
      setIsOpen(true)
    }
  }, [setIsOpen])

  const BackButton = () => {
    if (route.path === Path.wallet) return null

    return (
      <button
        className={styles.back}
        onClick={() => setRoute(route.previousPage)}
      >
        <BackIcon width={18} height={18} />
      </button>
    )
  }

  const render = () => {
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
        {isOpen ? (
          <>
            <WalletCloseIcon
              width={18}
              height={18}
              className={styles.close__icon}
            />
            <CloseIcon
              width={18}
              height={18}
              className={styles.close__icon__mobile}
            />
          </>
        ) : (
          <>
            <span>Wallet</span>
            <WalletIcon width={16} height={16} />
          </>
        )}
      </button>
      <WalletRouter value={{ route, setRoute }}>{render()}</WalletRouter>
    </div>
  )
}

export default Wallet
