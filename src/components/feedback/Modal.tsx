import { FC, ReactNode, useState } from "react"
import ReactModal from "react-modal"
import classNames from "classnames/bind"
import CloseIcon from "@mui/icons-material/Close"
import createContext from "utils/createContext"
import { getMaxHeightStyle } from "utils/style"
import styles from "./Modal.module.scss"

const cx = classNames.bind(styles)

ReactModal.setAppElement("#station")

interface ModalProps {
  closeIcon?: ReactNode
  icon?: ReactNode

  /* content */
  title?: ReactNode
  footer?: (close: ReactModal.Props["onRequestClose"]) => ReactNode

  /* style */
  confirm?: boolean
  maxHeight?: boolean | number
}

export interface Props extends ModalProps, ReactModal.Props {}

const Modal: FC<Props> = ({ title, children, footer, ...props }) => {
  const { icon, closeIcon, onRequestClose, confirm, maxHeight } = props

  return (
    <ReactModal
      {...props}
      className={styles.modal}
      overlayClassName={styles.overlay}
    >
      <button type="button" className={styles.close} onClick={onRequestClose}>
        {closeIcon ?? <CloseIcon fontSize="inherit" />}
      </button>

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
  renderButton: (open: () => void) => ReactNode
}

export const ModalButton: FC<ModalButtonProps> = (props) => {
  const { renderButton, ...rest } = props

  const [isModalOpen, setIsModalOpen] = useState(false)
  const open = () => setIsModalOpen(true)
  const close = () => setIsModalOpen(false)

  return (
    <ModalProvider value={close}>
      {renderButton(open)}
      <Modal {...rest} isOpen={isModalOpen} onRequestClose={close} />
    </ModalProvider>
  )
}
