import QRIcon from "@mui/icons-material/QrCodeScanner"
import HeaderIconButton from "../components/HeaderIconButton"
import { WebViewMessage, RN_APIS } from "utils/rnModule"

const QRScan = () => {
  const getCamera = async () => {
    const res = await WebViewMessage(RN_APIS.QR_SCAN, "test")
    return res
  }

  return (
    <HeaderIconButton
      onClick={async () => {
        const result = await getCamera()
        alert(result)
      }}
    >
      <QRIcon style={{ fontSize: 18 }} />
    </HeaderIconButton>
  )
}

export default QRScan
