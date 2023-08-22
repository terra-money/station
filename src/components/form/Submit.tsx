import { ButtonHTMLAttributes } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "station-ui"
import styles from "./Form.module.scss"

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  submitting?: boolean
}

const Submit = ({ submitting, ...attrs }: Props) => {
  const { t } = useTranslation()

  return (
    <Button
      label={t("Submit")}
      {...attrs}
      disabled={attrs.disabled || submitting}
      type={attrs.type ?? "submit"}
      className={styles.submit}
      color="primary"
      block
    >
      {attrs.children}
    </Button>
  )
}

export default Submit
