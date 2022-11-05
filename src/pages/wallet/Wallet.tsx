import styles from "./Wallet.module.scss"
import { ReactComponent as CloseIcon } from "styles/images/icons/WalletCloseArrow.svg"
import NetWorth from "./NetWorth"
import AssetList from "./AssetList"
import { useState } from "react"

const Wallet = () => {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div className={`${styles.wallet} ${!isOpen && styles.wallet__closed}`}>
      <button
        className={styles.close}
        onClick={() => {
          setIsOpen((o) => !o)
        }}
      >
        <CloseIcon width={18} height={18} />
      </button>
      <NetWorth />
      <AssetList />
    </div>
  )
}

export default Wallet
