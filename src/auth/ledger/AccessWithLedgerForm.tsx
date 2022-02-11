import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import UsbIcon from "@mui/icons-material/Usb"
import { LedgerKey } from "@terra-money/ledger-terra-js"
import { Form, FormError, FormItem, FormWarning } from "components/form"
import { Input, Submit } from "components/form"
import validate from "../scripts/validate"
import useAuth from "../hooks/useAuth"

interface Values {
  index: number
}

const AccessWithLedgerForm = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { connectLedger } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error>()

  /* form */
  const form = useForm<Values>({
    mode: "onChange",
    defaultValues: { index: 0 },
  })

  const { register, watch, handleSubmit, formState } = form
  const { errors } = formState
  const { index } = watch()

  const submit = async () => {
    setIsLoading(true)
    setError(undefined)

    try {
      connectLedger((await LedgerKey.create(undefined, index)).accAddress)
      navigate("/wallet", { replace: true })
    } catch (error) {
      setError(error as Error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form onSubmit={handleSubmit(submit)}>
      <section className="center">
        <UsbIcon style={{ fontSize: 56 }} />
        <p>{t("Plug in a Ledger device")}</p>
      </section>

      <FormItem /* do not translate this */
        label="Index"
        error={errors.index?.message}
      >
        <Input
          {...register("index", {
            valueAsNumber: true,
            validate: validate.index,
          })}
        />
        {index !== 0 && <FormWarning>{t("Default index is 0")}</FormWarning>}
      </FormItem>

      {error && <FormError>{error.message}</FormError>}

      <Submit submitting={isLoading}>{t("Connect")}</Submit>
    </Form>
  )
}

export default AccessWithLedgerForm
