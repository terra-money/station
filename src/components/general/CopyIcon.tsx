import ContentCopy from "@mui/icons-material/ContentCopy"
import Check from "@mui/icons-material/Check"
import { useState } from "react"

const CopyBox = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false)

  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
    >
      {copied ? <Check fontSize="small" /> : <ContentCopy fontSize="small" />}
    </button>
  )
}

export default CopyBox
