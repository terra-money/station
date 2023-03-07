import { useTranslation } from "react-i18next"
import styles from "./ReceivePage.module.scss"
import { capitalize } from "@mui/material"
import AddressTable from "app/components/AddressTable"

const ReceivePage = () => {
  const { t } = useTranslation()
  return (
    <section className={styles.receive}>
      <h1>{capitalize(t("receive"))}</h1>
      <AddressTable className={styles.address__table} />
    </section>
  )
}

export default ReceivePage
