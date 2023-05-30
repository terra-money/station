import React, { useState } from "react"
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown"
import classNames from "classnames"
import styles from "./ChainSelector.module.scss"

interface StandardDropdownProps {
  onChange: (chain: string) => void
  setNetworkIndex: (index: number) => void
  value: string
  small?: boolean
  networkOptions: { value: string; label: string }[]
  networkIndex: number
}

const StandardDropdown = ({
  networkOptions,
  onChange,
  value,
  small,
  networkIndex,
  setNetworkIndex,
}: StandardDropdownProps) => {
  const [open, setOpen] = useState(false)

  return (
    <div className={styles.container}>
      <button
        type="button"
        className={styles.selector}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setOpen((o) => !o)
        }}
      >
        <span>{networkOptions[networkIndex].label}</span>{" "}
        <ArrowDropDownIcon style={{ fontSize: 20 }} className={styles.caret} />
      </button>
      {open && (
        <div className={styles.options}>
          <div
            className={classNames(
              styles.options__container,
              small && styles.options__container__small
            )}
          >
            {networkOptions.map((option, index) => (
              <button
                className={option.value === value ? styles.active : ""}
                key={option.value}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onChange(option.value)
                  setNetworkIndex(index)
                  setOpen(false)
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default StandardDropdown
