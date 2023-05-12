import { useTheme } from "data/settings/Theme"
import styles from "./ActionsBackground.module.scss"

const ActionsBackground = () => {
  const { name } = useTheme()

  if (name === "light" || name === "whale") {
    return <></>
  }

  return <div className={styles.background_blur} />
}

export default ActionsBackground
