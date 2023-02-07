import { PropsWithChildren, useEffect, useState } from "react"
import Overlay from "./components/Overlay"
import LocalTerraError from "./LocalTerraError"
import { useChainID } from "data/wallet"
import NetworkLoading from "./NetworkLoading"
import axios from "axios"

enum Status {
  error = "error",
  success = "success",
  loading = "loading",
}

const WithNodeInfo = ({ children }: PropsWithChildren<{}>) => {
  const chainID = useChainID()
  const [state, setState] = useState<Status>(
    chainID === "localterra" ? Status.loading : Status.success
  )
  // FIXME: remove or make sure chainID is available
  useEffect(() => {
    ;(async () => {
      if (chainID !== "localterra") return
      const { data } = await axios.get(
        "cosmos/base/tendermint/v1beta1/node_info",
        {
          baseURL: "http://localhost:1317",
        }
      )
      if (data.default_node_info.network === "localterra") {
        setState(Status.success)
      } else {
        setState(Status.error)
      }
    })().catch(() => setState(Status.error))
  }, [chainID, state])

  if (chainID !== "localterra") return <>{children}</>

  switch (state) {
    case Status.error:
      return (
        <Overlay>
          <LocalTerraError refresh={() => setState(Status.loading)} />
        </Overlay>
      )
    case Status.loading:
      return <NetworkLoading />

    case Status.success:
      return <>{children}</>
  }
}

export default WithNodeInfo
