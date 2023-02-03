import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos"
import styles from "./SettingsButton.module.scss"

interface Props {
  title: string
  value?: string
  onClick: () => void
}

const SettingsButton = ({ title, value, onClick }: Props) => {
  return (
    <button className={styles.button} onClick={onClick}>
      {title}
      <div className={styles.button__action}>
        <span>{value ?? ""}</span>
        <ArrowForwardIosIcon fontSize="inherit" />
      </div>
    </button>
  )
}

export default SettingsButton
