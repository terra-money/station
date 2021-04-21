import { FC, useMemo } from "react"
import { QueryClient, QueryClientProvider } from "react-query"
import { useWallet, WalletStatus } from "@terra-money/wallet-provider"
import Splash from "auth/modules/Splash"
import Online from "./containers/Online"

const InitWallet: FC = ({ children }) => {
  const { status, network } = useWallet()
  const queryClient = useQueryClient()

  return status === WalletStatus.INITIALIZING ? (
    <Splash />
  ) : (
    <QueryClientProvider client={queryClient} key={network.name}>
      {children}
      <Online />
    </QueryClientProvider>
  )
}

export default InitWallet

/* hooks */
const useQueryClient = () => {
  const { network } = useWallet()
  const { name } = network

  return useMemo(() => {
    if (!name) throw new Error()
    return new QueryClient()
  }, [name])
}
