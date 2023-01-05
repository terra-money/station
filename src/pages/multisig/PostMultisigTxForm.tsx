import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useFieldArray, useForm } from "react-hook-form"
import { useSetRecoilState } from "recoil"
import { AccAddress, isTxError } from "@terra-money/feather.js"
import { LegacyAminoMultisigPublicKey } from "@terra-money/feather.js"
import { SimplePublicKey } from "@terra-money/feather.js"
import { SignatureV2, MultiSignature } from "@terra-money/feather.js"
import { SAMPLE_ADDRESS } from "config/constants"
import { useInterchainLCDClient } from "data/queries/lcdClient"
import { latestTxState } from "data/queries/tx"
import { Copy } from "components/general"
import { Form, FormError, FormGroup, FormItem } from "components/form"
import { Input, Submit, TextArea } from "components/form"
import { SAMPLE_ENCODED_TX, SAMPLE_SIGNATURE } from "./utils/placeholder"
import ReadTx from "./ReadTx"
import { useChainID } from "data/wallet"

interface Values {
  address: AccAddress
  tx: string
  signatures: SignatureValue[]
}

interface SignatureValue {
  address: string
  publicKey: SimplePublicKey.Data
  signature: string
}

interface Props {
  publicKey: LegacyAminoMultisigPublicKey
  sequence: number
  defaultValues: Values
}

const PostMultisigTxForm = ({ publicKey, sequence, ...props }: Props) => {
  // TODO: multisig is available only on terra, we need to handle it
  const { defaultValues } = props
  const { t } = useTranslation()
  const chainID = useChainID()

  /* form */
  const form = useForm<Values>({ mode: "onChange", defaultValues })
  const { register, control, watch, handleSubmit, formState } = form
  const { isValid } = formState
  const { tx } = watch()

  const fieldArray = useFieldArray({ control, name: "signatures" })
  const { fields } = fieldArray

  /* submit */
  const lcd = useInterchainLCDClient()
  const setLatestTx = useSetRecoilState(latestTxState)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<Error>()

  const getSignature = (signature: string) => {
    const data = JSON.parse(Buffer.from(signature.trim(), "base64").toString())
    return SignatureV2.fromData(data)
  }

  const submit = async ({ signatures, tx: encoded }: Values) => {
    setSubmitting(true)
    setError(undefined)

    try {
      const tx = lcd.tx.decode(encoded.trim())
      if (!tx) throw new Error("Invalid tx")

      // signatures
      const multisig = new MultiSignature(publicKey)
      const values = signatures
        .filter(({ signature }) => signature)
        .map(({ signature }) => signature)

      multisig.appendSignatureV2s(values.map(getSignature))

      // signatures >> tx
      const descriptor = multisig.toSignatureDescriptor()
      tx.appendSignatures([new SignatureV2(publicKey, descriptor, sequence)])

      // broadcast
      const result = await lcd.tx.broadcastSync(tx, chainID)
      if (isTxError(result)) throw new Error(result.raw_log)
      setLatestTx({ txhash: result.txhash, chainID: "phoenix-1" })
    } catch (error) {
      setError(error as Error)
    }

    setSubmitting(false)
  }

  return (
    <ReadTx tx={tx.trim()}>
      <Form onSubmit={handleSubmit(submit)}>
        <FormItem label={t("Multisig address")}>
          <Input
            {...register("address", { validate: AccAddress.validate })}
            placeholder={SAMPLE_ADDRESS}
          />
        </FormItem>

        <FormItem label={t("Tx")} extra={<Copy text={tx} />}>
          <TextArea
            {...register("tx", { required: true })}
            placeholder={SAMPLE_ENCODED_TX}
            rows={6}
          />
        </FormItem>

        <FormItem label={t("Signature")}>
          {fields.map(({ address, id }, index) => (
            <FormGroup key={id}>
              <FormItem label={address}>
                <TextArea
                  {...register(`signatures.${index}.signature`)}
                  placeholder={SAMPLE_SIGNATURE}
                  rows={6}
                  autoFocus={!index}
                />
              </FormItem>
            </FormGroup>
          ))}
        </FormItem>

        {error && <FormError>{error.message}</FormError>}

        <Submit submitting={submitting} disabled={!isValid} />
      </Form>
    </ReadTx>
  )
}

export default PostMultisigTxForm
