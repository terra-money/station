import { ModalButton, Mode } from "components/feedback"
import { RenderButton } from "types/components"
import { Toggle } from "../../../components/form"
import useAuth from "../../hooks/useAuth"
import UseBioAuthForm from "./UseBioAuthForm"

interface Props {
  renderButton?: RenderButton
}

const BioToggle = () => {
  const { isUseBio } = useAuth()

  const defaultRenderButton: Props["renderButton"] = (open) => (
    <div onClick={open}>
      <Toggle large={true} checked={isUseBio} onChange={() => {}} />
    </div>
  )

  return (
    <ModalButton
      renderButton={defaultRenderButton}
      modalType={Mode.BOTTOM}
      maxHeight
    >
      <UseBioAuthForm />
    </ModalButton>
  )
}

export default BioToggle
