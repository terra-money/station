import { PropsWithChildren } from "react"
import classNames from "classnames/bind"
import InfoIcon from "@mui/icons-material/Info"
import { Flex } from "../layout"
import styles from "./FormHelp.module.scss"

const Component = (props: PropsWithChildren<{ className: string }>) => {
  const { children, className } = props
  return (
    <div className={classNames(styles.component, className)}>
      <Flex>
        <InfoIcon fontSize="inherit" style={{ fontSize: 18 }} />
      </Flex>
      <span>{children}</span>
    </div>
  )
}

export const FormHelp = (props: PropsWithChildren<{}>) => {
  return <Component {...props} className={styles.info} />
}

export const FormWarning = (props: PropsWithChildren<{}>) => {
  return <Component {...props} className={styles.warning} />
}

export const FormError = (props: PropsWithChildren<{}>) => {
  return <Component {...props} className={styles.error} />
}
