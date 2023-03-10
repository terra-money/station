import styles from "components/layout/SettingsSelector.module.scss"
import { Toggle } from "components/form"

interface Props {
  onChange: any
  options: { value: string; selected: boolean; label: string; icon?: string }[]
}

const SettingsSelectorToggle = ({ options, onChange }: Props) => {
  return (
    <div className={styles.wrapper}>
      <section className={styles.selector}>
        {options.map(({ value, selected, label, icon }) => (
          <div className={styles.accordion} key={value}>
            <div className={styles.item} onClick={() => onChange(value)}>
              <div className={styles.icons_container}>
                {icon && <img src={icon} alt={label} />}
                {label}
              </div>
              <Toggle checked={selected} onChange={() => onChange(value)} />
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}

export default SettingsSelectorToggle
