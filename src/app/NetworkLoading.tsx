import { FlexColumn } from "components/layout"
import styles from "./NetworkError.module.scss"
import { useTheme } from "data/settings/Theme"
import Overlay from "./components/Overlay"
import { useEffect, useState } from "react"
import { Button } from "components/general"
import ReplayIcon from "@mui/icons-material/Replay"

interface Props {
  title?: string
  timeout?: {
    time: number
    fallback: () => void
  }
}

const NetworkLoading = ({ title, timeout }: Props) => {
  const { name, animation } = useTheme()
  const [showTimeout, setShowTimeout] = useState(false)

  useEffect(() => {
    let t: NodeJS.Timeout
    if (timeout) {
      t = setTimeout(() => setShowTimeout(true), timeout.time)
    }
    return () => t && clearTimeout(t)
  }, [title, timeout])

  return (
    <Overlay className={name}>
      <FlexColumn gap={20}>
        <img src={animation} alt="Loading..." width={120} height={120} />
        <article>
          <FlexColumn gap={18}>
            <h1 className={styles.title}>
              {title ? `${title}` : "Loading..."}
            </h1>
            {timeout && showTimeout && (
              <FlexColumn gap={10}>
                <p>Something went wrong</p>
                <Button color="primary" onClick={timeout.fallback}>
                  <ReplayIcon /> Reload Station
                </Button>
              </FlexColumn>
            )}
          </FlexColumn>
        </article>
      </FlexColumn>
    </Overlay>
  )
}

export default NetworkLoading
