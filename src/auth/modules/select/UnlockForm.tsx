import { useTranslation } from "react-i18next"
import { useNavigate, useParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { Form, FormItem } from "components/form"
import { Input, Submit } from "components/form"
import { testPassword, unlockWallet } from "../../scripts/keystore"
import useAuth from "../../hooks/useAuth"

interface Values {
  password: string
}

const UnlockForm = () => {
  const { t } = useTranslation()
  const { name } = useParams()
  const navigate = useNavigate()
  const { connect } = useAuth()

  if (!name) throw new Error("Invalid path")

  /* form */
  const form = useForm<Values>({ mode: "onChange" })
  const { register, handleSubmit, formState } = form
  const { errors, isValid } = formState

  /* submit */
  const submit = ({ password }: Values) => {
    unlockWallet(name, password)
    connect(name)
    navigate("/", { replace: true })
  }

  return (
    <Form onSubmit={handleSubmit(submit)}>
      <FormItem label={t("Password")} error={errors.password?.message}>
        <Input
          {...register("password", {
            validate: (password) => {
              try {
                testPassword({ name, password })
              } catch {
                return "Incorrect password"
              }
            },
          })}
          type="password"
          autoFocus
        />
      </FormItem>

      <Submit disabled={!isValid} />
    </Form>
  )
}

export default UnlockForm
