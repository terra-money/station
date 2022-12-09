import { PropsWithChildren } from "react"
import { useNodeInfo } from "data/queries/tendermint"
import Overlay from "./components/Overlay"
import NetworkError from "./NetworkError"
import { useNetworkName } from "data/wallet"

const WithNodeInfo = ({ children }: PropsWithChildren<{}>) => {
  const network = useNetworkName()
  // FIXME: remove or make sure chainID is available
  const { isLoading, isError } = useNodeInfo(
    network === "mainnet" ? "phoenix-1" : "pisco-1"
  )

  if (isError) {
    return (
      <Overlay>
        <NetworkError />
      </Overlay>
    )
  }

  if (isLoading) return null
  return <>{children}</>
}

export default WithNodeInfo
