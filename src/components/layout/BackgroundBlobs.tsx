import { useTheme } from "data/settings/Theme"
import styles from "./BackgroundBlobs.module.scss"

const BackgroundBlobs = () => {
  const { name } = useTheme()

  if (name === "moon") {
    return (
      <>
        <div className={styles.blob1} />
        <div className={styles.blob2} />
        <div className={styles.blob3} />
      </>
    )
  }

  return <></>
}

export default BackgroundBlobs
