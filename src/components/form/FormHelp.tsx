import { FC } from "react"
import classNames from "classnames/bind"
import InfoIcon from "@mui/icons-material/Info"
import { Flex } from "../layout"
import styles from "./FormHelp.module.scss"

const Component: FC<{ className: string }> = ({ children, className }) => {
  return (
    <div className={classNames(styles.component, className)}>
      <Flex>
        <InfoIcon fontSize="inherit" style={{ fontSize: 18 }} />
      </Flex>
      <span>{children}</span>
    </div>
  )
}

export const FormHelp: FC = (props) => {
  return <Component {...props} className={styles.info} />
}

export const FormWarning: FC = (props) => {
  return <Component {...props} className={styles.warning} />
}

export const FormError: FC = (props) => {
  return <Component {...props} className={styles.error} />
}
