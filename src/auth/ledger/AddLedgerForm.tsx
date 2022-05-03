import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useLocation, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import UsbIcon from "@mui/icons-material/Usb"
import { LedgerKey } from "@terra-money/ledger-terra-js"
import BluetoothTransport from "@ledgerhq/hw-transport-web-ble"
import { LEDGER_TRANSPORT_TIMEOUT } from "config/constants"
import { Form, FormError, FormItem, FormWarning } from "components/form"
import { Checkbox, Input, Submit } from "components/form"
import validate from "../scripts/validate"
import useAuth from "../hooks/useAuth"
import { RN_APIS, WebViewMessage } from "../../utils/rnModule"

interface Values {
  index: number
  bluetooth: boolean
}

interface DeviceInterface {
  name: string
  id: string
}

const AddLedgerForm = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { connectLedger, getLedgerKey } = useAuth()
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
  const { index, bluetooth } = watch()

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

      console.log("GET_LEDGER_KEY", ledger)

      // @ts-ignore
      if (typeof ledger === "string" && ledger?.includes("Error")) {
        // @ts-ignore
        setError({ message: ledger })
      } else {
        // @ts-ignore
        const key = JSON.parse(ledger)
        connectLedger(key._accAddress, index, bluetooth)
        navigate("/wallet", { replace: true })
      }
    } catch (error) {
      console.log(error)
      setError(error as Error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form onSubmit={handleSubmit(submit)}>
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
