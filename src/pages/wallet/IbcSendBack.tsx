import { RenderButton } from "types/components"
import { ModalButton } from "components/feedback"
import IbcSendBackTx from "./IbcSendBackTx"

interface Props {
  children: RenderButton
  title: string
  token: string
  chainID: string
}

const IbcSendBack = ({
  children: renderButton,
  title,
  token,
  chainID,
}: Props) => {
  return (
    <ModalButton title={title} renderButton={renderButton}>
      <IbcSendBackTx token={token} chainID={chainID} />
    </ModalButton>
  )
}

export default IbcSendBack
