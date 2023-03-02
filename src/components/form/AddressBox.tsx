import styles from "./AddressBox.module.scss"
import { CopyIcon } from "components/general"

const AddressBox = ({ address }: { address: string }) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.address}>{address}</div>
      <CopyIcon className={styles.copy} text={address} />
    </div>
  )
}

export default AddressBox
