import { useEffect, useLayoutEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useLocation, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { truncate } from "@terra.kitchen/utils"
import { Card } from "components/layout"
import { Form, FormError } from "components/form"
import useAuth from "../hooks/useAuth"
import { parseTx, RN_APIS, WebViewMessage } from "../../utils/rnModule"
import { useRecoilState } from "recoil"
import { latestTxState } from "../../data/queries/tx"

interface Values {
  index: number
  bluetooth: boolean
}

interface DeviceInterface {
  name: string
  id: string
}

const SelectLedgerForm = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { connectLedger } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error>()
  const [ledgers, setLedgers] = useState<DeviceInterface[]>([])
  const { state }: { state: any } = useLocation()
  const [tx, setTx] = useState<any>(null)
  const [latestTx, setLatestTx] = useRecoilState(latestTxState)
  const { wallet, validatePassword, isUseBio, decodeBioAuthKey, ...auth } =
    useAuth()
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
    console.log(ledgers)
    // @ts-ignore
    setLedgers(ledgers)
  }

  useEffect(() => {
    if (state) {
      const tx = parseTx(JSON.parse(state))
      console.log(tx)
      setTx(tx)
    }
  }, [state])

  useLayoutEffect(() => {
    getLedgers()
  }, [])

  return (
    <Form key="select-ledger">
      {!!ledgers.length ? (
        tx ? (
          ledgers?.map((item, idx) => (
            <Card
              key={item.id}
              title={item.name}
              onClick={async () => {
                console.log(tx)
                const result = await auth.post(tx, item.id)
                setLatestTx({ txhash: result.txhash })
              }}
            >
              {truncate(item.id)}
            </Card>
          ))
        ) : (
          ledgers?.map((item, idx) => (
            <Card
              key={item.id}
              title={item.name}
              onClick={() => {
                navigate("/auth/ledger/add", {
                  state: ledgers[idx],
                })
              }}
            >
              {truncate(item.id)}
            </Card>
          ))
        )
      ) : (
        <FormError>No ledgers</FormError>
      )}

      {error && <FormError>{error.message}</FormError>}
    </Form>
  )
}

export default SelectLedgerForm
