import { Close } from "@mui/icons-material"
import styles from "./PageBanner.module.scss"

const PageBanner = ({
  title,
  buttonHref,
  onClose,
}: {
  title: string
  buttonHref: string
  onClose?: () => void
}) => {
  return (
    <div className={styles.page__banner__container}>
      <div className={styles.content}>
        <h4>{title}</h4>
        <a
          className={styles.button}
          href={buttonHref}
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn More
        </a>
      </div>
      {onClose && <Close onClick={onClose} className={styles.close__icon} />}
    </div>
  )
}

export default PageBanner
