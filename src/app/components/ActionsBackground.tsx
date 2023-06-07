import { useTheme } from "data/settings/Theme"
import styles from "./ActionsBackground.module.scss"

const ActionsBackground = () => {
  const { name } = useTheme()

  if (name === "moon") {
    return <div className={styles.background_blur} />
  }

  return <></>
}

export default ActionsBackground
