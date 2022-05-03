import { Content, Contents } from "types/components"
import { Grid } from "components/layout"
import styles from "./ValidatorNumbers.module.scss"

export const ValidatorNumber = ({ title, content }: Content) => {
  return (
    <Grid className={styles.item}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.value}>{content}</p>
    </Grid>
  )
}

const ValidatorNumbers = ({ contents }: { contents: Contents }) => {
  return (
    <Grid className={styles.numbers}>
      {contents.map((content, index) => (
        <ValidatorNumber {...content} key={index} />
      ))}
    </Grid>
  )
}

export default ValidatorNumbers
