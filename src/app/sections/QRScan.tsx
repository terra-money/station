import { WebViewMessage, RN_APIS } from "utils/rnModule"
import { ReactComponent as QRIcon } from "styles/images/menu/QR.svg"

const QRScan = () => {
  const getCamera = async () => {
    const res = await WebViewMessage(RN_APIS.QR_SCAN)
    return res
  }

  return (
    <QRIcon
      style={{ width: 24, height: 24 }}
      onClick={async () => {
        await getCamera()
      }}
    />
  )
}

export default QRScan
