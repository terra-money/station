import { useCallback, useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useForm } from "react-hook-form"
import { MsgStoreCode } from "@terra-money/feather.js"
import { Form, FormItem, Upload } from "components/form"
import Tx from "../Tx"
import { useInterchainAddresses } from "auth/hooks/useAddress"

interface TxValues {
  code: string
}

// TODO: make this interchain
const StoreCodeForm = ({ chainID }: { chainID: string }) => {
  const { t } = useTranslation()
  const addresses = useInterchainAddresses()
  const address = addresses && addresses[chainID]

  /* form */
  const [file, setFile] = useState<File>()
  const form = useForm<TxValues>({ mode: "onChange" })
  const { watch, setValue, handleSubmit } = form
  const values = watch()

  useEffect(() => {
    const store = async (file: File) => {
      setValue("code", await readFile(file))
    }

    if (file) store(file)
  }, [file, setValue])

  /* tx */
  const createTx = useCallback(
    ({ code }: TxValues) => {
      if (!address || !code) return
      const msgs = [new MsgStoreCode(address, code)]
      return { msgs, chainID }
    },
    [address, chainID]
  )

  /* fee */
  const estimationTxValues = useMemo(() => values, [values])

  const tx = {
    estimationTxValues,
    createTx,
    chain: chainID,
  }

  return (
    <Tx {...tx}>
      {({ fee, submit }) => (
        <Form onSubmit={handleSubmit(submit.fn)}>
          <FormItem label={t("File")}>
            <Upload value={file} onUpload={setFile} />
          </FormItem>

          {fee.render()}
          {submit.button}
        </Form>
      )}
    </Tx>
  )
}

export default StoreCodeForm

/* helpers */
const readFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.readAsDataURL(file)

    reader.onload = () => {
      let encoded = reader.result?.toString().replace(/^data:(.*,)?/, "") ?? ""
      if (encoded.length % 4 > 0)
        encoded += "=".repeat(4 - (encoded.length % 4))

      resolve(encoded)
    }

    reader.onerror = (error) => reject(error)
  })
}
