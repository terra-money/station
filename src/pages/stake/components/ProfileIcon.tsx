import { useState } from "react"
import styles from "./ProfileIcon.module.scss"
import { useThemeFavicon } from "data/settings/Theme"

interface Props {
  src?: string
  size: number
}

const ProfileIcon = ({ src, size }: Props) => {
  const [error, setError] = useState(false)
  const stationIcon = useThemeFavicon()

  const attrs = { className: styles.icon, width: size, height: size }
  if (error || !src) return <img {...attrs} src={stationIcon} alt="" />
  return (
    <img
      {...attrs}
      src={`https://raw.githubusercontent.com/terra-money/validator-images/main/images/${src}.jpg`}
      onError={() => setError(true)}
      alt=""
    />
  )
}

export default ProfileIcon
