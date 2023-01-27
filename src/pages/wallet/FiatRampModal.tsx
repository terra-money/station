import { FIAT_RAMP, KADO_API_KEY } from "config/constants"
import { useAddress } from "data/wallet"
import { useState } from "react"
import { LoadingCircular } from "components/feedback"

const FiatRampModal = () => {
  const address = useAddress()
  const [isLoading, setIsLoading] = useState(true)

  const rampParams = {
    network: "Terra",
    onToAddress: address || "",
    apiKey: KADO_API_KEY,
  }

  const kadoUrlParams = new URLSearchParams(rampParams).toString()

  return (
    <>
      {isLoading && <LoadingCircular size={36} thickness={2} />}
      {
        <iframe
          src={`${FIAT_RAMP}?${kadoUrlParams}`}
          width="500"
          height="686"
          title="Kado Ramp"
          onLoad={() => setIsLoading(false)}
        />
      }
    </>
  )
}

export default FiatRampModal
