import {
  PropsWithChildren,
  ReactNode,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react"
import { useLocation } from "react-router-dom"
import ReactModal from "react-modal"
import classNames from "classnames/bind"
import CloseIcon from "@mui/icons-material/Close"
import { RenderButton } from "types/components"
import createContext from "utils/createContext"
import { getMaxHeightStyle } from "utils/style"
import styles from "./Modal.module.scss"
import { Button } from "../general"

const cx = classNames.bind(styles)

ReactModal.setAppElement("#station")

interface ModalProps {
  closeIcon?: ReactNode
  icon?: ReactNode
  modalType?: string | undefined
  subAction?: () => ReactNode

  /* content */
  title?: ReactNode
  footer?: (close: ReactModal.Props["onRequestClose"]) => ReactNode

  /* style */
  confirm?: boolean
  maxHeight?: boolean | number
  cancelButton?: {
    name: string
    type: string
  }
}

export interface Props extends ModalProps, ReactModal.Props {}

export enum Mode {
  DEFAULT = "default",
  TX = "tx",
  TX_RESULT = "txResult",
  FULL = "full",
  FULL_CARD = "fullCard",
  BOTTOM = "bottom",
  BOTTOM_CONFIRM = "bottomConfirm",
  SELECT = "select",
  LOADING = "loading",
}

const Modal = (props: PropsWithChildren<Props>) => {
  const { title, children, footer } = props
  const {
    icon,
    closeIcon,
    onRequestClose,
    confirm,
    maxHeight,
    modalType,
    subAction,
    cancelButton,
    className,
  } = props

  return (
    <ReactModal
      {...props}
      closeTimeoutMS={200}
      className={cx(styles.modal, { className, [`${modalType}`]: !!modalType })}
      overlayClassName={cx(styles.overlay, { [`${modalType}`]: !!modalType })}
    >
      {onRequestClose && (
        <button
          type="button"
          className={styles.close}
          onClick={(e) => {
            e.stopPropagation()
            onRequestClose(e)
          }}
        >
          {closeIcon ?? <CloseIcon fontSize="inherit" />}
        </button>
      )}

      {subAction && <div className={styles.action}>{subAction()}</div>}

      {(title || icon) && (
        <header className={styles.header}>
          <section className={styles.icon}>{icon}</section>
          <h1 className={cx(styles.title, { confirm })}>{title}</h1>
        </header>
      )}

      {children && (
        <section
          className={styles.main}
          style={getMaxHeightStyle(maxHeight, 320)}
        >
          {children}
          {(modalType === Mode.BOTTOM || modalType === Mode.BOTTOM_CONFIRM) &&
            cancelButton && (
              <Button block color="default" onClick={onRequestClose}>
                {cancelButton.name}
              </Button>
            )}
        </section>
      )}

      {footer && (
        <footer className={styles.footer}>{footer(onRequestClose)}</footer>
      )}
    </ReactModal>
  )
}

export default Modal

/* helper */
export const [useModal, ModalProvider] = createContext<() => void>("useModal")

interface ModalButtonProps extends ModalProps {
  renderButton: RenderButton
  modalKey?: string
}

export type ModalRef = {
  open: () => void
  close: () => void
}

export const ModalButton = forwardRef<
  ModalRef,
  PropsWithChildren<ModalButtonProps>
>((props, ref) => {
  const { pathname } = useLocation()
  const { renderButton, modalKey = pathname, ...rest } = props

  const [isModalOpen, setIsModalOpen] = useState(false)
  const open = () => setIsModalOpen(true)
  const close = () => setIsModalOpen(false)

  useEffect(() => {
    close()
  }, [modalKey])

  useImperativeHandle(ref, () => ({
    open,
    close,
  }))

  return (
    <ModalProvider value={close}>
      {renderButton(open)}
      <Modal {...rest} isOpen={isModalOpen} onRequestClose={close} />
    </ModalProvider>
  )
})
