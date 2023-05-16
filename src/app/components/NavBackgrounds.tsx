import { useTheme } from "data/settings/Theme"
import BlossomVideo from "styles/themes/Blossom/Nav.mp4"
import MoonVideo from "styles/themes/Moon/Top Large 2V7.mp4"
import styles from "./NavBackgrounds.module.scss"

const NavBackgrounds = () => {
  const { name } = useTheme()

  if (name === "blossom") {
    return (
      <div className={styles.nav_background_wrapper}>
        <video key={BlossomVideo} autoPlay muted loop playsInline>
          <source src={BlossomVideo} type="video/mp4" />
        </video>
      </div>
    )
  }

  if (name === "moon") {
    return (
      <div className={`${styles.nav_background_wrapper} ${styles.moon}`}>
        <video key={MoonVideo} autoPlay muted loop playsInline>
          <source src={MoonVideo} type="video/mp4" />
        </video>
      </div>
    )
  }

  return <></>
}

export default NavBackgrounds
