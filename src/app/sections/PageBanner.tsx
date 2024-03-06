import { Close } from "@mui/icons-material"
import styles from "./PageBanner.module.scss"
import { useTheme } from "data/settings/Theme"
import classNames from "classnames/bind"

const cx = classNames.bind(styles)

const PageBanner = ({
  title,
  buttonHref,
  onClose,
}: {
  title: string
  buttonHref: string
  onClose?: () => void
}) => {
  const theme = useTheme()

  return (
    <div className={cx(styles.page__banner__container, theme.name)}>
      {onClose && <Close onClick={onClose} className={styles.close__icon} />}
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
    </div>
  )
}

export default PageBanner
