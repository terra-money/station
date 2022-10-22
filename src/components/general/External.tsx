import { ForwardedRef, forwardRef, HTMLProps, ReactNode, useState } from "react"
import CallMadeIcon from "@mui/icons-material/CallMade"
import CloseIcon from "@mui/icons-material/Close"
import styles from "./Internal.module.scss"
import { Modal } from "components/feedback"
import { Submit } from "components/form"

interface ExternalLinkProps extends HTMLProps<HTMLAnchorElement> {
  icon?: boolean
}

export const ExternalLink = forwardRef(
  (
    { icon, children, href, ...attrs }: ExternalLinkProps,
    ref: ForwardedRef<HTMLAnchorElement>
  ) => {
    if (!validateLink(href)) return null

    return (
      <a
        {...attrs}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        ref={ref}
      >
        {children}
        {icon && <CallMadeIcon fontSize="inherit" />}
      </a>
    )
  }
)

interface ExternalIconLinkProps extends HTMLProps<HTMLAnchorElement> {
  icon?: ReactNode
}

export const ExternalIconLink = forwardRef(
  (
    { icon, children, href, ...attrs }: ExternalIconLinkProps,
    ref: ForwardedRef<HTMLAnchorElement>
  ) => {
    if (!validateLink(href)) return null

    return (
      <a
        {...attrs}
        className={styles.item}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        ref={ref}
      >
        <span className={styles.icon}>{icon}</span>
        {children}
      </a>
    )
  }
)

interface ExternalModalLinkProps extends HTMLProps<HTMLAnchorElement> {
  icon?: ReactNode
  modalBody?: ReactNode
  modalButtonTitle: string
  modalIcon?: ReactNode
  modalTitle?: string
}

export const ExternalModalLink = forwardRef(
  (
    {
      icon,
      children,
      href,
      modalBody,
      modalButtonTitle,
      modalIcon,
      modalTitle,
      ...attrs
    }: ExternalModalLinkProps,
    ref: ForwardedRef<HTMLAnchorElement>
  ) => {
    const [isModalOpen, setIsModalOpen] = useState(false)

    if (!validateLink(href)) return null

    const handleLinkNavigation = () => {
      setIsModalOpen(false)
      window.open(href, "_blank")
    }

    const setModalOpen = (open: boolean) => {
      setIsModalOpen(open)
    }

    return (
      <>
        <a
          {...attrs}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setModalOpen(true)
          }}
          ref={ref}
        >
          {children}
          {icon && <CallMadeIcon fontSize="inherit" />}
        </a>

        {isModalOpen && (
          <Modal
            onRequestClose={(e) => {
              setModalOpen(false)
            }}
            isOpen
            icon={modalIcon}
            closeIcon={<CloseIcon />}
            title={modalTitle}
            footer={() => (
              <Submit type="button" onClick={handleLinkNavigation}>
                {modalButtonTitle}
              </Submit>
            )}
            confirm={false}
          >
            {modalBody}
          </Modal>
        )}
      </>
    )
  }
)

export const validateLink = (href?: string) => {
  if (!href) return false

  try {
    const url = new URL(href)
    return ["https:", "mailto:"].includes(url.protocol)
  } catch {
    return false
  }
}
