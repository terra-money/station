import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useLocation, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { Form, FormError, FormItem, FormWarning } from "components/form"
import { Input, Submit } from "components/form"
import { FlexColumn } from "components/layout"
import validate from "../scripts/validate"
import useAuth from "../hooks/useAuth"
import { RN_APIS, WebViewMessage } from "../../utils/rnModule"
import { ReactComponent as LedgerIcon } from "styles/images/menu/Ledger.svg"

interface Values {
  index: number
  bluetooth: boolean
}

const AddLedgerForm = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { connectLedger } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error>()
  const { state }: { state: any } = useLocation()

  /* form */
  const form = useForm<Values>({
    mode: "onChange",
    defaultValues: { index: 0, bluetooth: true },
  })

  const { register, watch, handleSubmit, formState } = form
  const { errors } = formState
  const { index } = watch()

  const submit = async ({ index, bluetooth }: Values) => {
    setIsLoading(true)
    setError(undefined)

    try {
      // const ledger: unknown = await WebViewMessage(RN_APIS.GET_LEDGER_KEY, { id: state.id, path: index })
      //
      const ledger = await WebViewMessage(RN_APIS.GET_LEDGER_KEY, {
        id: state.id,
        path: 0,
      })

      // @ts-ignore
      if (typeof ledger === "string" && ledger?.includes("Error")) {
        // @ts-ignore
        setError({ message: ledger })
      } else {
        // @ts-ignore
        const key = JSON.parse(ledger)
        const ledgerName = state.name.replace(/ /g, "")
        connectLedger(key._accAddress, index, bluetooth, ledgerName)
        navigate("/wallet", { replace: true })
      }
    } catch (error) {
      setError(error as Error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form onSubmit={handleSubmit(submit)}>
      <FlexColumn>
        <LedgerIcon {...{ width: 56, height: 56, fill: "currentColor" }} />
        <p>Plug in a Ledger device</p>
      </FlexColumn>
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

export default AddLedgerForm
