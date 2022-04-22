import { useCallback, useEffect, useLayoutEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useForm } from "react-hook-form"
import { Pre } from "components/general"
import { Grid } from "components/layout"
import { Form, FormItem, FormWarning } from "components/form"
import { Input, RadioButton, Submit } from "components/form"
import { Modal } from "components/feedback"
import useAuth from "../../hooks/useAuth"
import QRCode from "../../components/QRCode"
import encrypt from "../../scripts/encrypt"
import { RN_APIS, WebViewMessage } from "../../../utils/rnModule"

enum Mode {
  QR = "QR code",
  KEY = "Private key",
}

interface Values {
  mode: Mode
  password: string
}

const UseBioAuthForm = () => {
  const { t } = useTranslation()
  const { isUseBio, validatePassword, encodeBioAuthKey, disableBioAuth } =
    useAuth()

  /* form */
  const form = useForm<Values>()
  const { register, handleSubmit, formState, setError } = form
  const { errors } = formState

  const submitDisable = () => disableBioAuth()

  const submitAble = async ({ password }: Values) => {
    if (!password) return
    const res = await WebViewMessage(RN_APIS.AUTH_BIO, "test")
    if (res) {
      encodeBioAuthKey(password)
      // const key = decodeBioAuthKey()
      // console.log(key)
    } else {
      setError("password", { type: "invalid", message: "failed bio" })
    }
  }

  return (
    <>
      <Form onSubmit={handleSubmit(isUseBio ? submitDisable : submitAble)}>
        {isUseBio ? (
          <>
            Currently use bio auth
            <Submit>Disable Bio Auth</Submit>
          </>
        ) : (
          <>
            <FormItem label={t("Password")} error={errors.password?.message}>
              <Input
                {...register("password", { validate: validatePassword })}
                type="password"
                autoFocus
              />
            </FormItem>
            <Submit />
          </>
        )}
      </Form>
    </>
  )
}

export default UseBioAuthForm
