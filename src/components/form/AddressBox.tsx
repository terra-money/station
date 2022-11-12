import styles from "./AddressBox.module.scss"
import ContentCopy from "@mui/icons-material/ContentCopy"
import Check from "@mui/icons-material/Check"
import { useState } from "react"

const AddressBox = ({ address }: { address: string }) => {
  const [copied, setCopied] = useState(false)

  return (
    <div className={styles.wrapper}>
      <div className={styles.address}>{address}</div>
      <button
        className={styles.after}
        onClick={() => {
          navigator.clipboard.writeText(address)
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        }}
      >
        {copied ? <Check fontSize="small" /> : <ContentCopy fontSize="small" />}
      </button>
    </div>
  )
}

export default AddressBox
