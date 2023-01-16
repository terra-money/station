import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useForm } from "react-hook-form"
import { AccAddress, SignatureV2 } from "@terra-money/feather.js"
import { SAMPLE_ADDRESS } from "config/constants"
import { useInterchainLCDClient } from "data/queries/lcdClient"
import { Pre } from "components/general"
import { Form, FormError, FormItem } from "components/form"
import { Input, Submit, TextArea } from "components/form"
import { Modal } from "components/feedback"
import { isWallet, useAuth } from "auth"
import { PasswordError } from "auth/scripts/keystore"
import { SAMPLE_ENCODED_TX } from "./utils/placeholder"
import ReadTx from "./ReadTx"
import { useChainID } from "data/wallet"

interface TxValues {
  address: AccAddress
  tx: string
}

interface Props {
  defaultValues: TxValues
}

const SignMultisigTxForm = ({ defaultValues }: Props) => {
  const { t } = useTranslation()
  const { wallet, createSignature } = useAuth()
  const lcd = useInterchainLCDClient()

  /* form */
  const form = useForm<TxValues>({ mode: "onChange", defaultValues })
  const { register, watch, handleSubmit, formState } = form
  const { isValid } = formState
  const { tx } = watch()
  const chainID = useChainID()

  /* submit */
  const passwordRequired = isWallet.single(wallet)
  const [password, setPassword] = useState("")
  const [incorrect, setIncorrect] = useState<string>()

  const disabled = passwordRequired && !password ? t("Enter password") : ""

  const [signature, setSignature] = useState<SignatureV2>()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<Error>()

  const submit = async ({ address, tx }: TxValues) => {
    setSubmitting(true)

    try {
      const decoded = lcd.tx.decode(tx.trim())
      if (!decoded) throw new Error("Invalid tx")
      const signature = await createSignature(
        decoded,
        chainID,
        address,
        password
      )
      setSignature(signature)
    } catch (error) {
      if (error instanceof PasswordError) setIncorrect(error.message)
      else setError(error as Error)
    }

    setSubmitting(false)
  }

  const submittingLabel = isWallet.ledger(wallet) ? t("Confirm in ledger") : ""

  return (
    <ReadTx tx={tx.trim()}>
      <Form onSubmit={handleSubmit(submit)}>
        <FormItem label={t("Multisig address")}>
          <Input
            {...register("address", { validate: AccAddress.validate })}
            placeholder={SAMPLE_ADDRESS}
            autoFocus
          />
        </FormItem>

        <FormItem label={t("Tx")}>
          <TextArea
            {...register("tx", { required: true })}
            placeholder={SAMPLE_ENCODED_TX}
            rows={6}
          />
        </FormItem>

        {passwordRequired && (
          <FormItem label={t("Password")} error={incorrect}>
            <Input
              type="password"
              value={password}
              onChange={(e) => {
                setIncorrect(undefined)
                setPassword(e.target.value)
              }}
            />
          </FormItem>
        )}

        {error && <FormError>{error.message}</FormError>}

        <Submit submitting={submitting} disabled={!!disabled || !isValid}>
          {submitting ? submittingLabel : disabled}
        </Submit>
      </Form>

      {signature && (
        <Modal
          title={t("Signature")}
          isOpen
          onRequestClose={() => setSignature(undefined)}
        >
          <Pre normal break copy>
            {toBytes(signature)}
          </Pre>
        </Modal>
      )}
    </ReadTx>
  )
}

export default SignMultisigTxForm

/* utils */
const toBytes = (signature: SignatureV2) => {
  const string = JSON.stringify(signature.toData())
  return Buffer.from(string).toString("base64")
}
