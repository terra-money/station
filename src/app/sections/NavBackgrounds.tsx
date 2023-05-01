import { useTheme } from "data/settings/Theme"
import BlossomVideo from "../../styles/themes/Blossom/Nav.mp4"
import styles from "./NavBackgrounds.module.scss"

const NavBackgrounds = () => {
  const { name } = useTheme()

  const BlossomBackground = (
    <div className={styles.nav_background_wrapper}>
      <video autoPlay muted loop>
        <source src={BlossomVideo} type="video/mp4" />
      </video>
    </div>
  )

  return <>{name === "blossom" && BlossomBackground}</>
}

export default NavBackgrounds
