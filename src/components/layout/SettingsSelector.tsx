import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useNetworks } from "app/InitNetworks"
import classNames from "classnames/bind"
import { Tooltip } from "components/display"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import Flex from "./Flex"
import styles from "./SettingsSelector.module.scss"

const cx = classNames.bind(styles)
interface Props {
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
  withSearch?: boolean
  withToggle?: boolean
}

const SettingsSelector = ({
  value,
  options,
  onChange,
  withSearch,
  withToggle,
}: Props) => {
  const { t } = useTranslation()

  const selected = value
  const [openAcc, setOpenAcc] = useState(0)

  const handleClick = (index: any, e: any) => {
    e.stopPropagation()
    setOpenAcc(index === openAcc ? 0 : index)
  }

  const { networks } = useNetworks()
  const networksOnSelection = networks[value] || {}

  return (
    <div className={styles.wrapper}>
      <section className={styles.selector}>
        {options.map(({ value, label }, index) => (
          <div
            className={cx(
              styles.accordion,
              openAcc === index + 1 ? "opened" : ""
            )}
          >
            <button
              key={value}
              className={styles.item}
              onClick={() => onChange(value)}
            >
              <div className={styles.icons_container}>
                <div>{label}</div>
                {Object.keys(networksOnSelection ?? {}).length > 1 && (
                  <Tooltip content={t("View active chains")}>
                    <KeyboardArrowDownIcon
                      className={styles.icon}
                      onClick={(e) => handleClick(index + 1, e)}
                    />
                  </Tooltip>
                )}
              </div>
              <Flex className={styles.track}>
                <span
                  className={cx(styles.indicator, {
                    checked: selected === value,
                  })}
                />
              </Flex>
            </button>
            <div
              className={cx(
                styles.content,
                openAcc === index + 1 ? "opened" : ""
              )}
            >
              {Object.keys(networksOnSelection ?? {}).length > 1 &&
                Object.keys(networksOnSelection ?? {}).map((network: any) => (
                  <div
                    className={styles.network}
                    key={networksOnSelection[network]?.chainID}
                  >
                    <img
                      src={networksOnSelection[network].icon}
                      alt={networksOnSelection[network].name}
                    />
                    {networksOnSelection[network].name}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}

export default SettingsSelector
