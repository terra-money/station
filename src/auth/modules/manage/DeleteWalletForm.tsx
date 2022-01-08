import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import DoneAllIcon from "@mui/icons-material/DoneAll"
import { Form, FormItem, FormWarning, Input, Submit } from "components/form"
import { deleteWallet } from "../../scripts/keystore"
import useAuth from "../../hooks/useAuth"
import ConfirmModal from "./ConfirmModal"

interface Values {
  password: string
}

const DeleteWalletForm = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { getConnectedWallet, disconnect, validatePassword } = useAuth()

  /* form */
  const form = useForm<Values>()
  const { register, handleSubmit, formState } = form
  const { errors } = formState

  const [done, setDone] = useState(false)
  const submit = ({ password }: Values) => {
    const { name } = getConnectedWallet()
    disconnect()
    deleteWallet({ name, password })
    setDone(true)
  }

  return (
    <>
      {done && (
        <ConfirmModal
          icon={<DoneAllIcon className="success" fontSize="inherit" />}
          onRequestClose={() => navigate("/", { replace: true })}
        >
          {t("Wallet deleted successfully")}
        </ConfirmModal>
      )}

      <Form onSubmit={handleSubmit(submit)}>
        <FormItem label={t("Password")} error={errors.password?.message}>
          <Input
            {...register("password", { validate: validatePassword })}
            type="password"
            autoFocus
          />
        </FormItem>

        <FormWarning>
          {t("Mnemonic is required to recover this wallet")}
        </FormWarning>
        <Submit />
      </Form>
    </>
  )
}

export default DeleteWalletForm
