import { FIAT_RAMP, KADO_API_KEY } from "config/constants"
import { useNetwork } from "data/wallet"
import { useState } from "react"
import { LoadingCircular } from "components/feedback"
import styles from "./FiatRampModal.module.scss"
import { useTheme } from "data/settings/Theme"
import qs from "qs"
import { useInterchainAddresses } from "auth/hooks/useAddress"

const FiatRampModal = () => {
  const addresses = useInterchainAddresses()
  const network = useNetwork()
  const [isLoading, setIsLoading] = useState(true)
  const { name: theme } = useTheme()

  if (!addresses) return null

  const onToAddressMulti = Object.keys(addresses ?? {})
    .map((key) => `${network[key]?.name}:${addresses[key]}`)
    .join(",")

  const rampParams = {
    network: "Terra",
    apiKey: KADO_API_KEY,
    product: "BUY",
    onRevCurrency: "USDC",
    networkList: ["TERRA", "OSMOSIS", "KUJIRA", "JUNO"].join(","),
    productList: ["BUY", "SELL"].join(","),
    theme,
    onToAddressMulti,
    cryptoList: ["USDC", "OSMO"].join(","),
  }

  const kadoUrlParams = qs.stringify(rampParams)

  const src = `${FIAT_RAMP}?${kadoUrlParams}`
  return (
    <div className={styles.container}>
      {isLoading && (
        <div className={styles.loading}>
          <LoadingCircular size={36} thickness={2} />
        </div>
      )}
      <iframe
        className={styles.iframe}
        src={src}
        title="Kado"
        onLoad={() => setIsLoading(false)}
      />
    </div>
  )
}

export default FiatRampModal
