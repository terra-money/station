import { ButtonHTMLAttributes } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "components/general"
import styles from "./Form.module.scss"

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  submitting?: boolean
}

const Submit = ({ submitting, ...attrs }: Props) => {
  const { t } = useTranslation()

  return (
    <Button
      loading={submitting}
      disabled={attrs.disabled || submitting}
      type={attrs.type ?? "submit"}
      className={styles.submit}
      color="primary"
      block
    >
      {attrs.children || t("Submit")}
    </Button>
  )
}

export default Submit
