import { PropsWithChildren } from "react"
import { useNodeInfo } from "data/queries/tendermint"
import Overlay from "./components/Overlay"
import NetworkError from "./NetworkError"

const WithNodeInfo = ({ children }: PropsWithChildren<{}>) => {
  const { isLoading, isError } = useNodeInfo()

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
