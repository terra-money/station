import { PropsWithChildren, ReactNode } from "react"
import classNames from "classnames/bind"
import { Flex, Grid } from "../layout"
import styles from "./Radio.module.scss"

const cx = classNames.bind(styles)

interface Props {
  label: ReactNode
  className?: string
  checked: boolean
  disabled?: boolean
  onClick?: () => void
  reversed?: boolean
}

const Radio = (props: PropsWithChildren<Props>) => {
  const { label, children, checked, disabled, onClick, reversed } = props
  const className = cx(styles.component, { checked, disabled }, props.className)

  const input = (
    <Flex className={styles.track}>
      <span className={styles.indicator} />
    </Flex>
  )

  return (
    <button type="button" className={className} onClick={onClick}>
      <Grid gap={4}>
        <Flex gap={8} start className={cx({ reversed })}>
          {reversed ? (
            <>
              {label}
              {input}
            </>
          ) : (
            <>
              {input}
              {label}
            </>
          )}
        </Flex>

        {children}
      </Grid>
    </button>
  )
}

export default Radio
