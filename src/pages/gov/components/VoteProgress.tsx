import { useLayoutEffect, PropsWithChildren, useRef, useState } from "react"
import styles from "./VoteProgress.module.scss"
import { Flex } from "components/layout"
import classNames from "classnames"

const Flag = ({ left, children }: PropsWithChildren<{ left: string }>) => {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)

  useLayoutEffect(() => {
    if (ref.current) setWidth(ref.current.offsetWidth)
  }, [ref.current?.offsetWidth])

  let maxTranslate = 45
  switch (children) {
    case "Pass Threshold":
      maxTranslate = 45
      break
    case "Vote Threshold":
      maxTranslate = 45.3
      break
    case "Quorum":
      maxTranslate = 23.9
      break
  }

  const translateStyle = {
    "--x-pos":
      (parseFloat(left) / 100) * width < maxTranslate
        ? `-${(parseFloat(left) / 100) * width}px`
        : "-50%",
  } as React.CSSProperties
  return (
    <div ref={ref} className={styles.flag} style={{ left }}>
      <span className={styles.label} style={translateStyle}>
        {children}
      </span>
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
