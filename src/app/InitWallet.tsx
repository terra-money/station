import { PropsWithChildren, useEffect, useMemo } from "react"
import { QueryClient, QueryClientProvider } from "react-query"
import { WalletStatus } from "@terra-money/wallet-types"
import { useWallet } from "@terra-money/use-wallet"
import { useNetworkName } from "data/wallet"
import { isWallet, useAuth } from "auth"
import Online from "./containers/Online"
import NetworkLoading from "./NetworkLoading"
import { sandbox } from "auth/scripts/env"

const InitWallet = ({ children }: PropsWithChildren<{}>) => {
  useOnNetworkChange()
  const { status } = useWallet()
  const queryClient = useQueryClient()
  const networkName = useNetworkName()

  return status === WalletStatus.INITIALIZING && !sandbox ? (
    <NetworkLoading
      title="Initializing your wallet..."
      timeout={{
        time: 3000,
        fallback: () => {
          localStorage.removeItem("__terra_extension_router_session__")
          window.location.reload()
        },
      }}
    />
  ) : (
    <QueryClientProvider client={queryClient} key={networkName}>
      {children}
      <Online />
    </QueryClientProvider>
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

const useQueryClient = () => {
  const name = useNetworkName()

  return useMemo(() => {
    if (!name) throw new Error()
    return new QueryClient()
  }, [name])
}
