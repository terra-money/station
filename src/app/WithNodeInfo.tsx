import { PropsWithChildren } from "react"
import { useNodeInfo } from "data/queries/tendermint"
import Overlay from "./components/Overlay"
import NetworkError from "./NetworkError"
import { useChainID } from "data/wallet"

const WithNodeInfo = ({ children }: PropsWithChildren<{}>) => {
  const chainID = useChainID()
  // FIXME: remove or make sure chainID is available
  const { isLoading, isError } = useNodeInfo(chainID)

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
