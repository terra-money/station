import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useFieldArray, useForm } from "react-hook-form"
import axios from "axios"
import AddIcon from "@mui/icons-material/Add"
import RemoveIcon from "@mui/icons-material/Remove"
import { AccAddress, SimplePublicKey } from "@terra-money/feather.js"
import { LegacyAminoMultisigPublicKey } from "@terra-money/feather.js"
import { SAMPLE_ADDRESS } from "config/constants"
import { getErrorMessage } from "utils/error"
import { useInterchainLCDClient } from "data/queries/lcdClient"
import { Grid } from "components/layout"
import { Form, FormGroup, FormItem } from "components/form"
import { FormError, FormWarning } from "components/form"
import { Input, Submit, Paste } from "components/form"
import validate from "../../scripts/validate"

interface Values {
  addresses: { value: AccAddress }[]
  threshold: number
}

interface Props {
  onCreated: (publicKey: LegacyAminoMultisigPublicKey) => void
}

const CreateMultisigWalletForm = ({ onCreated }: Props) => {
  const { t } = useTranslation()
  const lcd = useInterchainLCDClient()

  /* form */
  const defaultValues = {
    addresses: [{ value: "" }, { value: "" }, { value: "" }],
    threshold: 2,
  }

  const form = useForm<Values>({ mode: "onChange", defaultValues })

  const { register, control, handleSubmit, formState } = form
  const { errors, isValid } = formState

  const fieldArray = useFieldArray({ control, name: "addresses" })
  const { fields, append, remove } = fieldArray

  const [error, setError] = useState<Error>()

  const paste = async (lines: string[]) => {
    const values = lines
      .filter((addr) => AccAddress.validate(addr, "terra"))
      .map((value) => ({ value }))
    if (values.length) fieldArray.replace(values)
  }

  /* query */
  const getPublicKey = async (address: AccAddress) => {
    const accountInfo = await lcd.auth.accountInfo(address)
    const publicKey = accountInfo.getPublicKey()
    if (!publicKey) throw new Error(`Public key is null: ${address}`)
    return publicKey
  }

  const getPublicKeys = async (addresses: AccAddress[]) => {
    const results = await Promise.allSettled(addresses.map(getPublicKey))

    return results.map((result) => {
      if (result.status === "rejected") {
        const message = axios.isAxiosError(result.reason)
          ? getErrorMessage(result.reason)
          : result.reason

        throw new Error(message)
      }

      return result.value as SimplePublicKey
    })
  }

  /* submit */
  const [submitting, setSubmitting] = useState(false)

  const submit = async ({ addresses, threshold }: Values) => {
    setSubmitting(true)

    try {
      const values = addresses.map(({ value }) => value)
      const publicKeys = await getPublicKeys(values)
      const publicKey = new LegacyAminoMultisigPublicKey(threshold, publicKeys)
      onCreated(publicKey)
    } catch (error) {
      setError(error as Error)
    }

    setSubmitting(false)
  }

  /* render */
  const length = fields.length
  return (
    <Form onSubmit={handleSubmit(submit)}>
      <Grid gap={4}>
        <FormWarning>
          {t(
            "A new multisig wallet is created when the order of addresses or the threshold change"
          )}
        </FormWarning>
        <FormWarning>{t("Participants must have coins")}</FormWarning>
      </Grid>

      <FormItem label={t("Address")} extra={<Paste paste={paste} />}>
        {fields.map(({ id }, index) => (
          <FormGroup
            button={
              length - 1 === index
                ? {
                    onClick: () => append({ value: "" }),
                    children: <AddIcon style={{ fontSize: 18 }} />,
                  }
                : {
                    onClick: () => remove(index),
                    children: <RemoveIcon style={{ fontSize: 18 }} />,
                  }
            }
            key={id}
          >
            <FormItem>
              <Input
                {...register(`addresses.${index}.value`, {
                  validate: AccAddress.validate,
                })}
                placeholder={SAMPLE_ADDRESS}
              />
            </FormItem>
          </FormGroup>
        ))}
      </FormItem>

      <FormItem label={t("Threshold")} error={errors.threshold?.message}>
        <Input
          {...register("threshold", {
            valueAsNumber: true,
            validate: validate.index,
          })}
          placeholder={String(Math.ceil(length / 2))}
        />
      </FormItem>

      {error && <FormError>{error.message}</FormError>}

      <Submit submitting={submitting} disabled={!isValid} />
    </Form>
  )
}

export default CreateMultisigWalletForm
