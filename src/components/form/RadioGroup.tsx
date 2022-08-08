import { Key } from "react"
import Radio from "./Radio"
import styles from "./RadioGroup.module.scss"
import classNames from "classnames/bind"

const cx = classNames.bind(styles)

interface Props<T> {
  options: {
    value: T
    label: string
    tokenValue?: string
    disabled?: boolean
  }[]
  value: T
  onChange: (value: T) => void
  reversed?: boolean
  className?: string
  mobileModal?: boolean
}

function RadioGroup<T extends Key>(props: Props<T>) {
  const { options, value, onChange, reversed, mobileModal } = props

  const className = cx(styles.list, { mobileModal }, props.className)

  return (
    <section className={className}>
      {options.map(({ label, disabled, tokenValue, ...option }) => {
        const checked = option.value === value
        return (
          <Radio
            label={label}
            className={styles.item}
            checked={checked}
            onClick={() => !disabled && onChange(option.value)}
            disabled={disabled}
            key={option.value}
            reversed={reversed}
            tokenValue={tokenValue}
          />
        )
      })}
    </section>
  )
}

export default RadioGroup
