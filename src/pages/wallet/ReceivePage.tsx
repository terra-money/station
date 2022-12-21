import { useInterchainAddresses } from "auth/hooks/useAddress"
import AddressBox from "components/form/AddressBox"
import ChainSelector from "components/form/ChainSelector"
import { useNetwork } from "data/wallet"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import styles from "./ReceivePage.module.scss"

const ReceivePage = () => {
  const networks = useNetwork()
  const addresses = useInterchainAddresses()

  const { t } = useTranslation()
  const [chain, setChain] = useState<string>("")

  // TODO: handle wallet not connected
  return (
    <section className={styles.receive}>
      <h1>{t("Receive")}</h1>
      <p>Chain</p>
      <ChainSelector
        chainsList={Object.keys(networks)}
        onChange={(chainID) => setChain(chainID)}
      />
      <p>Address</p>
      <AddressBox address={addresses?.[chain] ?? "Connect wallet first"} />
    </section>
  )
}

export default ReceivePage
