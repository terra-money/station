import QRCodeReact from "qrcode.react"
import variable from "styles/variable"
import { Flex } from "components/layout"

const QRCode = ({ value }: { value: string }) => {
  return (
    <Flex>
      <QRCodeReact
        value={value}
        size={320}
        bgColor={variable("--card-bg")}
        fgColor={variable("--text")}
        renderAs="svg"
      />
    </Flex>
  )
}

export default QRCode
