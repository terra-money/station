import styles from "components/layout/SettingsSelector.module.scss"
import { Toggle } from "components/form"
import { useNetwork } from "data/wallet"

interface Props {
  onChange: any
  options: { value: string; selected: boolean; label: string }[]
}

const SettingsSelectorToggle = ({ options, onChange }: Props) => {
  const network = useNetwork()
  return (
    <div className={styles.wrapper}>
      <section className={styles.selector}>
        {options.map(({ value, selected, label }) => (
          <div className={styles.accordion} key={value}>
            <div className={styles.item} onClick={() => onChange(value)}>
              <div className={styles.icons_container}>
                <img src={network[value].icon} alt={label} />
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
