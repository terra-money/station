import { PropsWithChildren } from "react"
import classNames from "classnames"
import { Flex } from "components/layout"
import styles from "./VoteProgress.module.scss"

const Flag = ({ left, children }: PropsWithChildren<{ left: string }>) => {
  return (
    <div className={styles.flag} style={{ left }}>
      <span className={styles.label}>{children}</span>
      <span className={styles.line} />
    </div>
  )
}

interface Props {
  flag: { percent: string; label: string }
  list: { percent: string; color: string }[]
}

const VoteProgress = ({ flag, list }: Props) => {
  return (
    <div>
      <Flag left={flag.percent}>{flag.label}</Flag>

      <Flex className={styles.track} start>
        {list.map(({ percent: width, color }) => {
          const className = classNames(styles.item, `bg-${color}`)
          return <span className={className} style={{ width }} key={color} />
        })}
      </Flex>
    </div>
  )
}

export default VoteProgress
