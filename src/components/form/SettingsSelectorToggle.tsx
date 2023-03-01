import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useNetworks } from "app/InitNetworks"
import classNames from "classnames/bind"
import { Tooltip } from "components/display"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import Flex from "components/layout"
import styles from "components/layout/SettingsSelector.module.scss"
import { Toggle } from "components/form"

const cx = classNames.bind(styles)
interface Props {
  onChange: any
  options: { value: string; selected: boolean; label: string }[]
}

const SettingsSelectorToggle = ({ options, onChange }: Props) => {
  return (
    <div className={styles.wrapper}>
      <section className={styles.selector}>
        {options.map(({ value, selected, label }) => (
          <button key={value} onChange={() => onChange(value)}>
            <div>label: {label}</div>
            <div>value: {value}</div>
            <Toggle checked={selected} onChange={() => onChange(value)} />
          </button>
        ))}
      </section>
    </div>
  )
}

export default SettingsSelectorToggle
