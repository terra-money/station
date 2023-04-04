import styles from "./AddressBox.module.scss"
import { CopyIcon, WalletQR } from "components/general"
import QrCodeIcon from "@mui/icons-material/QrCode"
import { truncate } from "@terra-money/terra-utils"

const AddressBox = ({
  address,
  withQR,
}: {
  address: string
  withQR: boolean
}) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.address}>{truncate(address)}</div>
      <div className={styles.btnWrapper}>
        <CopyIcon text={address} />
        {withQR && (
          <WalletQR
            address={address}
            renderButton={(open) => (
              <button>
                <QrCodeIcon style={{ fontSize: 18 }} onClick={open} />
              </button>
            )}
          />
        )}
      </div>
    </div>
  )
}

export default AddressBox
