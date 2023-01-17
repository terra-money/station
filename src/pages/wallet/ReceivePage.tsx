import { useAllInterchainAddresses } from "auth/hooks/useAddress"
// import AddressBox from "components/form/AddressBox"
// import ChainSelector from "components/form/ChainSelector"
// import { useNetwork } from "data/wallet"
// import { useState } from "react"
import { useTranslation } from "react-i18next"
import styles from "./ReceivePage.module.scss"
import { capitalize } from "@mui/material"
import InterchainAddressTable from "app/components/InterchainAddressTable"

const ReceivePage = () => {
  const addresses = useAllInterchainAddresses()

  const { t } = useTranslation()
  return (
    <section className={styles.receive}>
      <h1>{capitalize(t("receive"))}</h1>
      {!addresses && <p>{t("Connect wallet to see your addresses")})</p>}
      <InterchainAddressTable />
    </section>
  )
}

export default ReceivePage
