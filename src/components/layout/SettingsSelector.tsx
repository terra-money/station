import Flex from "./Flex"
import styles from "./SettingsSelector.module.scss"

interface Props {
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
  withSearch?: boolean
}

const SettingsSelector = ({ value, options, onChange, withSearch }: Props) => {
  const selected = value

  return (
    <div className={styles.wrapper}>
      <section className={styles.selector}>
        {options.map(({ value, label }) => (
          <button
            key={value}
            className={styles.item}
            onClick={() => onChange(value)}
          >
            {label}
            <Flex className={styles.track}>
              <span
                className={
                  selected === value
                    ? styles.indicator__checked
                    : styles.indicator
                }
              />
            </Flex>
          </button>
        ))}
      </section>
    </div>
  )
}

export default SettingsSelector
