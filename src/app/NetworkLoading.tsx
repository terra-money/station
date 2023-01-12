import { FlexColumn } from "components/layout"
import styles from "./NetworkError.module.scss"
import { useTheme } from "data/settings/Theme"
import Overlay from "./components/Overlay"

interface Props {
  title: string
}

const NetworkLoading = ({ title }: Props) => {
  const { name, animation } = useTheme()

  return (
    <Overlay className={name}>
      <FlexColumn gap={20}>
        <img src={animation} alt="Loading..." width={120} height={120} />
        <article>
          <h1 className={styles.title}>{title}</h1>
        </article>
      </FlexColumn>
    </Overlay>
  )
}

export default NetworkLoading
