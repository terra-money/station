import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew"
import styles from "./GoBack.module.scss"

const GoBack = () => {
  const { t } = useTranslation()

  return (
    <Link to=".." className={styles.link}>
      <ArrowBackIosNewIcon fontSize="inherit" />
      {t("Manage wallets")}
    </Link>
  )
}

export default GoBack
