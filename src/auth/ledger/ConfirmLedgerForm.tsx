import { useLayoutEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
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
import { LinkButton } from "../../components/general"

interface Values {
  index: number
  bluetooth: boolean
}

interface DeviceInterface {
  name: string
  id: string
}

const ConfirmLedgerForm = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { connectLedger } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error>()
  const [ledgers, setLedgers] = useState<DeviceInterface[]>([])

  /* form */
  const form = useForm<Values>({
    mode: "onChange",
    defaultValues: { index: 0, bluetooth: false },
  })

  const { register, watch, handleSubmit, formState } = form
  const { errors } = formState
  const { index, bluetooth } = watch()

  const getLedgers = async () => {
    const ledgers: unknown = await WebViewMessage(RN_APIS.GET_LEDGER_LIST)
    // @ts-ignore
    setLedgers(ledgers)
  }

  useLayoutEffect(() => {
    getLedgers()
  }, [])

  return (
    <Form>
      {!!ledgers.length ? (
        ledgers?.map((item, idx) => (
          <LinkButton
            key={item.id}
            to={"/auth/ledger/add"}
            state={ledgers[idx]}
            color="primary"
            block
          >
            {item.name}
          </LinkButton>
        ))
      ) : (
        <FormError>no ledgers</FormError>
      )}

      {error && <FormError>{error.message}</FormError>}
    </Form>
  )
}

export default ConfirmLedgerForm
