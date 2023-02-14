import { useState } from "react"
import styles from "./ChainSelector.module.scss"
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown"
import WithSearchInput from "pages/custom/WithSearchInput"
import classNames from "classnames"
import getRecord from "utils/getRecord"
import SafeImage from "components/general/SafeImage"

export interface ChainOption {
  id: string
  name: string
  icon?: string
}

interface Props {
  options: ChainOption[]
  onChange: (chain: string) => void
  value: string
  small?: boolean
}

const ChainInput = ({ options, onChange, value, small }: Props) => {
  const [open, setOpen] = useState(false)

  const optionsRecord = getRecord(options, (option) => option.id)

  return (
    <div className={styles.container}>
      <button
        className={styles.selector}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setOpen((o) => !o)
        }}
      >
        <span>
          <SafeImage
            src={optionsRecord[value]?.icon}
            fallback={<div />}
            render={(props) => (
              <img {...props} alt={optionsRecord[value]?.name} />
            )}
          />{" "}
          {optionsRecord[value]?.name}
        </span>{" "}
        <ArrowDropDownIcon style={{ fontSize: 20 }} className={styles.caret} />
      </button>
      {open && (
        <div className={styles.options}>
          <WithSearchInput inline gap={4}>
            {(search) => (
              <div
                className={classNames(
                  styles.options__container,
                  small && styles.options__container__small
                )}
              >
                {options
                  .filter(
                    ({ id, name }) =>
                      id.toLowerCase().includes(search.toLowerCase()) ||
                      name.toLowerCase().includes(search.toLowerCase())
                  )
                  .map(({ id, name, icon }) => (
                    <button
                      className={id === value ? styles.active : ""}
                      key={id}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        onChange(id)
                        setOpen(false)
                      }}
                    >
                      <SafeImage
                        src={icon}
                        fallback={<div />}
                        render={(props) => <img {...props} alt={name} />}
                      />
                      {name}
                    </button>
                  ))}
              </div>
            )}
          </WithSearchInput>
        </div>
      )}
    </div>
  )
}

export default ChainInput
