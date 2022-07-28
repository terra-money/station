import { PropsWithChildren, useEffect, useLayoutEffect, useMemo } from "react"
import { QueryClient, QueryClientProvider } from "react-query"
import { WalletStatus } from "@terra-money/wallet-types"
import { useWallet } from "@terra-money/use-wallet"
import { useNetwork, useNetworkName } from "data/wallet"
import { isWallet, useAuth } from "auth"
import Splash from "auth/modules/Splash"
import Online from "./containers/Online"
import WithNodeInfo from "./WithNodeInfo"
import { useTheme } from "../data/settings/Theme"

const InitWallet = ({ children }: PropsWithChildren<{}>) => {
  useOnNetworkChange()
  const { name } = useTheme()
  const { status } = useWallet()
  const queryClient = useQueryClient()
  const networkName = useNetworkName()

  useLayoutEffect(() => {
    if (name) document.body.classList.add(name)
  }, [])

  return status === WalletStatus.INITIALIZING && !isWallet.mobileNative() ? (
    <Splash />
  ) : (
    <QueryClientProvider client={queryClient} key={networkName}>
      <WithNodeInfo>{children}</WithNodeInfo>
      <Online />
    </QueryClientProvider>
  )
}

export default InitWallet

/* hooks */
const useOnNetworkChange = () => {
  const { preconfigure } = useNetwork()
  const { wallet, disconnect } = useAuth()
  const isPreconfiguredWallet = isWallet.preconfigured(wallet)
  const shouldDisconnect = !preconfigure && isPreconfiguredWallet

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
