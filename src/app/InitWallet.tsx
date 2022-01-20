import { FC, useMemo } from "react"
import { QueryClient, QueryClientProvider } from "react-query"
import { useWallet, WalletStatus } from "@terra-money/wallet-provider"
import { useNetworkName } from "data/wallet"
import Splash from "auth/modules/Splash"
import Online from "./containers/Online"
import WithNodeInfo from "./WithNodeInfo"

const InitWallet: FC = ({ children }) => {
  const { status } = useWallet()
  const queryClient = useQueryClient()
  const networkName = useNetworkName()

  return status === WalletStatus.INITIALIZING ? (
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
const useQueryClient = () => {
  const name = useNetworkName()

  return useMemo(() => {
    if (!name) throw new Error()
    return new QueryClient()
  }, [name])
}
