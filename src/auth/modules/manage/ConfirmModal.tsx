import { PropsWithChildren } from "react"
import { useTranslation } from "react-i18next"
import { Modal } from "components/feedback"
import { Props as ModalProps } from "components/feedback/Modal"
import { Submit } from "components/form"

const ConfirmModal = (props: PropsWithChildren<Omit<ModalProps, "isOpen">>) => {
  const { children, ...rest } = props
  const { t } = useTranslation()

  return (
    <Modal
      {...rest}
      isOpen
      closeIcon={false}
      title={children}
      footer={(close) => (
        <Submit type="button" onClick={close}>
          {t("Confirm")}
        </Submit>
      )}
      confirm
    />
  )
}

export default ConfirmModal
