import { ForwardedRef, forwardRef, InputHTMLAttributes } from "react"
import { useTranslation } from "react-i18next"
import classNames from "classnames/bind"
import { Flex, Grid } from "components/layout"
import styles from "./SlippageControl.module.scss"

const cx = classNames.bind(styles)

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  input?: number
  error?: string
}

const SlippageControl = forwardRef(
  ({ input, error, ...attrs }: Props, ref: ForwardedRef<HTMLInputElement>) => {
    const { t } = useTranslation()

    const warn = (n?: number) => {
      if (!n) return
      if (n > 5) return t("Transaction may be frontrun")
      if (n < 0.5) return t("Transaction may fail")
      return
    }

    const warning = warn(input)
    const className = cx(
      styles.wrapper,
      error ? "feedback-error" : warning ? "feedback-warning" : undefined
    )

    return (
      <Grid gap={2}>
        <section className={styles.main}>
          <label className={styles.label}>{t("Slippage tolerance")}</label>
          <Flex gap={2} className={className}>
            <input {...attrs} autoComplete="off" ref={ref} />
            <span>%</span>
          </Flex>
        </section>

        {error ? (
          <p className={styles.error}>{error}</p>
        ) : warning ? (
          <p className={styles.warning}>{warning}</p>
        ) : null}
      </Grid>
    )
  }
)

export default SlippageControl
