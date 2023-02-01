import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import DoneAllIcon from "@mui/icons-material/DoneAll"
import { Form, FormItem, FormWarning, Input, Submit } from "components/form"
import { Wrong } from "components/feedback"
import { isWallet } from "auth"
import { deleteWallet } from "../../scripts/keystore"
import useAuth from "../../hooks/useAuth"
import ConfirmModal from "./ConfirmModal"

interface Values {
  name: string
}

const DeleteWalletForm = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { wallet, disconnect } = useAuth()
  const name = isWallet.local(wallet) ? wallet.name : undefined

  /* form */
  const form = useForm<Values>({ mode: "onChange" })
  const { register, handleSubmit, formState } = form
  const { isValid } = formState

  /* submit */
  const [done, setDone] = useState(false)
  const submit = (values: Values) => {
    if (values.name !== name) return
    disconnect()
    deleteWallet(name)
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

      {!name ? (
        <Wrong>{t("Wallet is not connected")}</Wrong>
      ) : (
        <Form onSubmit={handleSubmit(submit)}>
          <FormItem>
            <p>
              Type <strong>{name}</strong> to confirm
            </p>

            <Input
              {...register("name", { validate: (value) => value === name })}
              autoFocus
            />
          </FormItem>

          <FormWarning>
            {t(
              "This action cannot be undone. A mnemonic is required to recover a deleted wallet."
            )}
          </FormWarning>

          <Submit disabled={!isValid} />
        </Form>
      )}
    </>
  )
}

export default DeleteWalletForm
