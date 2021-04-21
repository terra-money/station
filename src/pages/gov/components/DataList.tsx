import classNames from "classnames/bind"
import { Grid } from "components/layout"
import { Contents } from "types/components"
import styles from "./DataList.module.scss"

const cx = classNames.bind(styles)

interface Props {
  list: Contents
  type: "horizontal" | "vertical"
}

const DataList = ({ list, type }: Props) => {
  return (
    <div className={cx(type)}>
      {list.map(({ title, content }) => (
        <Grid gap={4} key={title}>
          <h1 className={styles.title}>{title}</h1>
          <p>{content}</p>
        </Grid>
      ))}
    </div>
  )
}

export default DataList
