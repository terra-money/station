import classNames from "classnames/bind"
import { Flex } from "components/layout"
import styles from "./ButtonGroup.module.scss"

const cx = classNames.bind(styles)

interface Props<T> {
  value: T
  onChange: (value: T) => void
  options: { value: T; label: string }[]
}

function ButtonGroup<T>({ value: selected, onChange, options }: Props<T>) {
  return (
    <Flex className={styles.group}>
      {options.map(({ label, value }) => {
        const isSelected = value === selected

        return (
          <button
            className={cx(styles.item, { active: isSelected })}
            onClick={() => onChange(value)}
            key={label}
          >
            {label}
          </button>
        )
      })}
    </Flex>
  )
}

export default ButtonGroup
