import FingerprintIcon from "@mui/icons-material/Fingerprint"
import HeaderIconButton from "../components/HeaderIconButton"
import { WebViewMessage, RN_APIS } from "utils/rnModule"

const Bio = () => {
  const getBio = async () => {
    const res = await WebViewMessage(RN_APIS.AUTH_BIO, "test")
    return res
  }

  return (
    <HeaderIconButton
      onClick={async () => {
        const result = await getBio()
        alert(result)
      }}
    >
      <FingerprintIcon style={{ fontSize: 18 }} />
    </HeaderIconButton>
  )
}

export default Bio
