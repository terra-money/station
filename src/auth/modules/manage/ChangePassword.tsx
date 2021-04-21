import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { Card, Page } from "components/layout"
import { Form, FormItem, Input, Submit } from "components/form"
import ConnectedWallet from "./ConnectedWallet"
import { changePassword } from "../../scripts/keystore"
import validate from "../../scripts/validate"
import useAuth from "../../hooks/useAuth"
import ConfirmModal from "./ConfirmModal"
import GoBack from "./GoBack"

interface Values {
  current: string
  password: string
  confirm: string
}

const ChangePassword = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { wallet, validatePassword } = useAuth()

  /* form */
  const form = useForm<Values>({ mode: "onChange" })
  const { register, watch, handleSubmit, formState } = form
  const { errors } = formState
  const { password } = watch()

  const [done, setDone] = useState(false)
  const submit = ({ current, password }: Values) => {
    if (!wallet) throw new Error("Wallet is not connected")
    const { name } = wallet
    changePassword({ name, oldPassword: current, newPassword: password })
    setDone(true)
  }

  return (
    <Page title={t("Change password")} extra={<GoBack />}>
      <ConnectedWallet>
        <Card>
          {done && (
            <ConfirmModal onRequestClose={() => navigate("..")}>
              {t("Password changed successfully")}
            </ConfirmModal>
          )}

          <Form onSubmit={handleSubmit(submit)}>
            <FormItem
              label={t("Current password")}
              error={errors.current?.message}
            >
              <Input
                {...register("current", { validate: validatePassword })}
                type="password"
                autoFocus
              />
            </FormItem>

            <FormItem
              label={t("New password")}
              error={errors.password?.message}
            >
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
                type="password"
              />
            </FormItem>

            <Submit />
          </Form>
        </Card>
      </ConnectedWallet>
    </Page>
  )
}

export default ChangePassword
