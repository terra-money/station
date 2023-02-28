import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { decode } from "js-base64"
import { Form, FormError, FormItem } from "components/form"
import { Input, TextArea, Submit, FormHelp } from "components/form"
import { Grid } from "components/layout"

import decrypt from "../../scripts/decrypt"
import { addWallet, PasswordError } from "../../scripts/keystore"
import useAuth from "../../hooks/useAuth"
import { wordsFromAddress } from "utils/bech32"

interface Values {
  key: string
  password: string
}

const ImportWalletForm = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { connect } = useAuth()

  /* form */
  const form = useForm<Values>({ mode: "onChange" })

  const { register, handleSubmit, formState } = form
  const { errors, isValid } = formState

  const [error, setError] = useState<Error>()

  /* submit */
  const submit = ({ key, password }: Values) => {
    try {
      interface Decoded {
        name: string
        address: string
        encrypted_key: string
      }

      const { name, address, encrypted_key }: Decoded = JSON.parse(decode(key))
      const pk = decrypt(encrypted_key, password)

      if (!pk) throw new PasswordError(t("Incorrect password"))

      addWallet({
        name,
        password,
        words: {
          "330": wordsFromAddress(address),
        },
        key: { "330": Buffer.from(pk, "hex") },
      })
      connect(name)
      navigate("/")
    } catch (error) {
      setError(error as Error)
    }
  }

  /* render */
  return (
    <Form onSubmit={handleSubmit(submit)}>
      <Grid gap={4}>
        <FormHelp>
          {t(
            "This form only accepts private keys exported from Station. Your new wallet will have the same name as the wallet you import."
          )}
        </FormHelp>
      </Grid>
      <FormItem label={t("Key")} error={errors.key?.message}>
        <TextArea
          {...register("key", {
            required: true,
            validate: (value) => isEncodedJSON(value) || "Invalid",
          })}
        />
      </FormItem>

      <FormItem label={t("Password")} error={errors.password?.message}>
        <Input {...register("password", { required: true })} type="password" />
      </FormItem>

      {error && <FormError>{error.message}</FormError>}

      <Submit disabled={!isValid} />
    </Form>
  )
}

export default ImportWalletForm

/* helpers */
const isEncodedJSON = (encoded: string) => {
  try {
    JSON.parse(decode(encoded))
    return true
  } catch {
    return false
  }
}
