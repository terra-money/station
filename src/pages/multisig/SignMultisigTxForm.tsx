import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useForm } from "react-hook-form"
import { AccAddress, SignatureV2 } from "@terra-money/terra.js"
import { SAMPLE_ADDRESS } from "config/constants"
import { useLCDClient } from "data/queries/lcdClient"
import { Pre } from "components/general"
import { Form, FormError, FormItem } from "components/form"
import { Input, Submit, TextArea } from "components/form"
import { Modal } from "components/feedback"
import { isWallet, useAuth } from "auth"
import { PasswordError } from "auth/scripts/keystore"
import { SAMPLE_ENCODED_TX } from "./utils/placeholder"
import ReadTx from "./ReadTx"
import ConfirmModal from "../../auth/modules/manage/ConfirmModal"
import { useNavigate } from "react-router-dom"

interface TxValues {
  address: AccAddress
  tx: string
}

interface Props {
  defaultValues: TxValues
}

const SignMultisigTxForm = ({ defaultValues }: Props) => {
  const { t } = useTranslation()
  const { wallet, createSignature, decodeBioAuthKey, isUseBio } = useAuth()
  const lcd = useLCDClient()
  const navigate = useNavigate()

  const [isFailBio, setIsFailBio] = useState(false)
  const [bioWithPassword, setBioWithPassword] = useState(false)

  /* form */
  const form = useForm<TxValues>({ mode: "onChange", defaultValues })
  const { register, watch, handleSubmit, formState } = form
  const { isValid } = formState
  const { tx } = watch()

  /* submit */
  const passwordRequired =
    !(isUseBio && !bioWithPassword) &&
    !isWallet.ledger(wallet) &&
    isWallet.single(wallet)
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

      if (isWallet.mobileNative() && isWallet.ledger(wallet)) {
        return navigate("/auth/ledger/device", {
          state: JSON.stringify({ signTx: tx.trim(), address }),
        })
      }

      if (isUseBio && !bioWithPassword) {
        const bioKey = await decodeBioAuthKey()
        const signature = await createSignature(decoded, address, bioKey)
        setSignature(signature)
      } else {
        const signature = await createSignature(decoded, address, password)
        setSignature(signature)
      }
    } catch (error) {
      if (error instanceof PasswordError) {
        setIncorrect(error.message)
      } else {
        if (
          error instanceof Error &&
          error?.message === "Failed bio authentication."
        ) {
          setIsFailBio(true)
        } else {
          setError(error as Error)
        }
      }
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

      {isFailBio && (
        <ConfirmModal
          onRequestClose={() => {
            setBioWithPassword(true)
            setIsFailBio(false)
          }}
        >
          {t("Would you like to confirm with your password?")}
        </ConfirmModal>
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
