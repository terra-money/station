import { FlexColumn } from "components/layout"
import styles from "./NetworkError.module.scss"
import { useFindTheme } from "data/settings/Theme"

interface Props {
  title: string
}

const NetworkLoading = ({ title }: Props) => {
  const find = useFindTheme()
  const { animation } = find("light")

  return (
    <FlexColumn gap={20}>
      <img src={animation} alt="Loading..." width={120} height={120} />

      <article>
        <h1 className={styles.title}>{title}</h1>
      </article>
    </FlexColumn>
  )
}

export default NetworkLoading
