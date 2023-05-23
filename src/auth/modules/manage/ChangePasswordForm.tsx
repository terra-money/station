import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { Form, FormItem, Input, Submit } from "components/form"
import { changePassword } from "../../scripts/keystore"
import validate from "../../scripts/validate"
import useAuth from "../../hooks/useAuth"
import ConfirmModal from "./ConfirmModal"

interface Values {
  current: string
  password: string
  confirm: string
}

const ChangePasswordForm = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { getConnectedWallet, validatePassword } = useAuth()

  /* form */
  const form = useForm<Values>({ mode: "onChange" })
  const { register, watch, handleSubmit, formState } = form
  const { errors } = formState
  const { password } = watch()

  const [done, setDone] = useState(false)
  const submit = ({ current, password }: Values) => {
    const { name } = getConnectedWallet()
    changePassword({ name, oldPassword: current, newPassword: password })
    setDone(true)
  }

  return (
    <>
      {done && (
        <ConfirmModal onRequestClose={() => navigate("/")}>
          {t("Password changed successfully")}
        </ConfirmModal>
      )}

      <Form onSubmit={handleSubmit(submit)}>
        <FormItem label={t("Current password")} error={errors.current?.message}>
          <Input
            {...register("current", { validate: validatePassword })}
            type="password"
            autoFocus
          />
        </FormItem>

        <FormItem label={t("New password")} error={errors.password?.message}>
          <Input
            {...register("password", { validate: validate.password })}
            type="password"
          />
        </FormItem>

        <FormItem
          label={t("Confirm new password")}
          error={errors.confirm?.message}
        >
          <Input
            {...register("confirm", {
              validate: (value) => validate.confirm(password, value),
            })}
            onFocus={() => form.trigger("confirm")}
            type="password"
          />
        </FormItem>

        <Submit />
      </Form>
    </>
  )
}

export default ChangePasswordForm
