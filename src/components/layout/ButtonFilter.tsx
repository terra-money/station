import { useState } from "react"
import styles from "./ButtonFilter.module.scss"
import { capitalize } from "@mui/material"
import { useTranslation } from "react-i18next"

const ButtonFilter = ({
  children,
  actions,
  title,
}: {
  children: (action?: string) => React.ReactNode
  actions: string[]
  title?: string
}) => {
  const [selectedAction, setAction] = useState<string>(actions[0])
  const { t } = useTranslation()

  return (
    <div className={styles.buttonfilter}>
      <div className={styles.header}>
        {title && <div className={styles.headerText}>{title}</div>}
      </div>
      <div className={styles.actions}>
        {actions.map((action) => (
          <button
            key={action}
            onClick={() => setAction(action)}
            className={selectedAction === action ? styles.active : undefined}
          >
            {capitalize(t(action))}
          </button>
        ))}
      </div>
      <div className={styles.content}>{children(selectedAction)}</div>
    </div>
  )
}

export default ButtonFilter
