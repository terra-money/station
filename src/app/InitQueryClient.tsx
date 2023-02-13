import { useNetworkName } from "data/wallet"
import { PropsWithChildren, useMemo } from "react"
import { QueryClient, QueryClientProvider } from "react-query"

const InitQueryClient = ({ children }: PropsWithChildren<{}>) => {
  const queryClient = useQueryClient()
  const networkName = useNetworkName()

  return (
    <QueryClientProvider client={queryClient} key={networkName}>
      {children}
    </QueryClientProvider>
  )
}

const useQueryClient = () => {
  const name = useNetworkName()

  return useMemo(() => {
    if (!name) throw new Error()
    return new QueryClient()
  }, [name])
}

export default InitQueryClient
