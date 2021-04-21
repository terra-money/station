import Radio from "./Radio"
import styles from "./RadioGroup.module.scss"

interface Props {
  options: { value: string; label: string; disabled?: boolean }[]
  value: string
  onChange: (value: string) => void
}

const RadioGroup = ({ options, value, onChange }: Props) => {
  return (
    <section className={styles.list}>
      {options.map(({ label, disabled, ...option }) => {
        const checked = option.value === value
        return (
          <Radio
            label={label}
            className={styles.item}
            checked={checked}
            onClick={() => !disabled && onChange(option.value)}
            disabled={disabled}
            key={option.value}
            reversed
          />
        )
      })}
    </section>
  )
}

export default RadioGroup
