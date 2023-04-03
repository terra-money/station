import styles from "components/layout/SettingsSelector.module.scss"
import { Toggle } from "components/form"
import { isTerraChain } from "utils/chain"

interface Props {
  onChange: any
  options: { value: string; selected: boolean; label: string; icon?: string }[]
  extra?: React.ReactNode
}

const SettingsSelectorToggle = ({ options, onChange, extra }: Props) => {
  return (
    <div className={styles.wrapper}>
      <section className={styles.selector}>
        {options.map(({ value, selected, label, icon }) => (
          <div className={styles.accordion} key={value}>
            <div className={styles.item} onClick={() => onChange(value)}>
              <div className={styles.icons_container}>
                {icon && <img src={icon} alt={label} />}
                {label}
                {extra}
              </div>
              {!isTerraChain(value) && (
                <Toggle checked={selected} onChange={() => onChange(value)} />
              )}
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}

export default SettingsSelectorToggle
