/*
 * @Author: lmk
 * @Date: 2022-08-02 17:03:00
 * @LastEditTime: 2022-10-18 12:14:57
 * @LastEditors: lmk
 * @Description: 
 */
import QRCodeReact from "qrcode.react"
import variable from "styles/variable"
import { Flex } from "components/layout"

const QRCode = ({ value }: { value: string }) => {
  const windowWidth = window.innerWidth;
  const codeWidth = windowWidth > 400 ? 320 : windowWidth - 40 - 40;
  return (
    <Flex>
      <QRCodeReact
        value={value}
        size={codeWidth}
        bgColor={variable("--card-bg")}
        fgColor={variable("--text")}
        renderAs="svg"
      />
    </Flex>
  )
}

export default QRCode
