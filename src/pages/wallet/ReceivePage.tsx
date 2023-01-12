import { useInterchainAddresses } from "auth/hooks/useAddress"
import AddressBox from "components/form/AddressBox"
import ChainSelector from "components/form/ChainSelector"
import { useNetwork } from "data/wallet"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import styles from "./ReceivePage.module.scss"
import { capitalize } from "@mui/material"

const ReceivePage = () => {
  const networks = useNetwork()
  const addresses = useInterchainAddresses()

  const { t } = useTranslation()
  const [chain, setChain] = useState<string>("")

  // TODO: handle wallet not connected
  return (
    <section className={styles.receive}>
      <h1>{capitalize(t("receive"))}</h1>
      <p>{t("Chain")}</p>
      <ChainSelector
        chainsList={Object.keys(networks)}
        onChange={(chainID) => setChain(chainID)}
      />
      <p>{t("Address")}</p>
      <AddressBox
        address={addresses?.[chain] ?? t("Connect wallet to see your address")}
      />
    </section>
  )
}

export default ReceivePage
