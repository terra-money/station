import classNames from "classnames/bind"
import BigNumber from "bignumber.js"
import { readPercent } from "@terra-money/terra-utils"
import { ReactComponent as Tilde } from "./Tilde.svg"
import styles from "./Orb.module.scss"

const cx = classNames.bind(styles)

const Orb = ({ ratio, size }: { ratio: number; size?: "large" }) => {
  const height = readPercent(BigNumber.min(ratio, 1))

  return (
    <div className={cx(styles.orb, size)}>
      <div className={styles.filled} style={{ height }}>
        {!!ratio && <Tilde className={styles.tilde} />}
      </div>
    </div>
  )
}

export default Orb
