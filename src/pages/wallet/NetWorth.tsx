import { Button } from "components/general"
import styles from "./NetWorth.module.scss"

const NetWorth = () => {
  return (
    <article className={styles.networth}>
      <p>Net Worth</p>
      <h1>$12,345.67</h1>
      <p>$1,234.56 available</p>
      <div className={styles.networth__buttons}>
        <Button color="primary">Buy</Button>
        <Button>Receive</Button>
        <Button>Send</Button>
      </div>
    </article>
  )
}

export default NetWorth
