import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos"
import styles from "./SettingsButton.module.scss"
import classNames from "classnames"

interface Props {
  title: string
  value?: string
  className?: string
  onClick: () => void
}

const cx = classNames.bind(styles)

const SettingsButton = ({ title, value, onClick, className }: Props) => {
  return (
    <button className={cx(styles.button, className)} onClick={onClick}>
      {title}
      <div className={styles.button__action}>
        <span>{value ?? ""}</span>
        <ArrowForwardIosIcon fontSize="inherit" />
      </div>
    </button>
  )
}

export default SettingsButton
