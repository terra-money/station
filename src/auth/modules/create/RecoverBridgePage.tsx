import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Auto, Card, Page } from "components/layout"
import { ReactComponent as QRIcon } from "styles/images/icons/QRLine.svg"
import { ReactComponent as SeedIcon } from "styles/images/icons/Seed.svg"
import { RN_APIS, WebViewMessage } from "../../../utils/rnModule"

const RecoverBridgePage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const IconSize = {
    width: 24,
    height: 24,
    fill: "currentColor",
  }

  const getCamera = async () => {
    const res = await WebViewMessage(RN_APIS.QR_SCAN)
    return res
  }

  return (
    <Page title={t("Recover wallet")} small>
      <Auto
        columns={[
          <Card
            title={t("Use seed phrase")}
            extra={<SeedIcon {...IconSize} />}
            onClick={() => {
              navigate("/auth/recover")
            }}
          />,
          <Card
            title={t("Scan QR code")}
            extra={<QRIcon {...IconSize} />}
            onClick={async () => {
              await getCamera()
            }}
          />,
        ]}
      />
    </Page>
  )
}

export default RecoverBridgePage
