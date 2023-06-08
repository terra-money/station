import { PropsWithChildren, useEffect } from "react"
import { WalletStatus, useWallet } from "@terra-money/wallet-kit"
import { isWallet, useAuth } from "auth"
import Online from "./containers/Online"
import NetworkLoading from "./NetworkLoading"
import { sandbox } from "auth/scripts/env"

const InitWallet = ({ children }: PropsWithChildren<{}>) => {
  useOnNetworkChange()
  const { status } = useWallet()

  return status === WalletStatus.INITIALIZING && !sandbox ? (
    <NetworkLoading
      timeout={{
        time: 3000,
        fallback: () => {
          localStorage.removeItem("__wallet_kit_connected_wallet")
          window.location.reload()
        },
      }}
    />
  ) : (
    <>
      {children}
      <Online />
    </>
  )
}

export default InitWallet

/* hooks */
const useOnNetworkChange = () => {
  const { wallet, disconnect } = useAuth()
  const isPreconfiguredWallet = isWallet.preconfigured(wallet)
  const shouldDisconnect = isPreconfiguredWallet

  useEffect(() => {
    if (shouldDisconnect) disconnect()
  }, [disconnect, shouldDisconnect])
}
