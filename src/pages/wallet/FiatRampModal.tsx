import { FIAT_RAMP, KADO_API_KEY } from "config/constants"
import { useAddress } from "data/wallet"
import { useState } from "react"
import { LoadingCircular } from "components/feedback"
import styles from "./FiatRampModal.module.scss"

const FiatRampModal = () => {
  const address = useAddress()
  const [isLoading, setIsLoading] = useState(true)

  const rampParams = {
    network: "Terra",
    onToAddress: address || "",
    apiKey: KADO_API_KEY,
    product: "BUY",
    onRevCurrency: "USDC",
  }

  const kadoUrlParams = new URLSearchParams(rampParams).toString()

  return (
    <div className={styles.container}>
      {isLoading && (
        <div className={styles.loading}>
          <LoadingCircular size={36} thickness={2} />
        </div>
      )}
      <iframe
        className={styles.iframe}
        src={`${FIAT_RAMP}?${kadoUrlParams}`}
        title="Kado Ramp"
        onLoad={() => setIsLoading(false)}
      />
    </div>
  )
}

export default FiatRampModal
