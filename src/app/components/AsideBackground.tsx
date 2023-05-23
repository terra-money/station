import MoonVideo from "styles/themes/Moon/Rocket V5 schuin.mp4"
import { useTheme } from "data/settings/Theme"
import styles from "./AsideBackground.module.scss"

const AsideBackground = () => {
  const { name } = useTheme()

  const handleVideoEnd = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const video = e.currentTarget

    video.pause()

    setTimeout(() => {
      video.play()
    }, 60 * 1000)
  }

  if (name === "moon") {
    return (
      <div className={`${styles.aside_background} ${styles.moon}`}>
        <video
          onEnded={handleVideoEnd}
          key={MoonVideo}
          autoPlay
          muted
          playsInline
        >
          <source src={MoonVideo} type="video/mp4" />
        </video>
      </div>
    )
  }

  return <></>
}

export default AsideBackground
