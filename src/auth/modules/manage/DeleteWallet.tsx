import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import DoneAllIcon from "@mui/icons-material/DoneAll"
import { Card, Page } from "components/layout"
import { Form, FormItem, FormWarning, Input, Submit } from "components/form"
import { deleteWallet } from "../../scripts/keystore"
import useAuth from "../../hooks/useAuth"
import ConnectedWallet from "./ConnectedWallet"
import ConfirmModal from "./ConfirmModal"
import GoBack from "./GoBack"

interface Values {
  password: string
}

const DeleteWallet = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { wallet, disconnect, validatePassword } = useAuth()

  /* form */
  const form = useForm<Values>()
  const { register, handleSubmit, formState } = form
  const { errors } = formState

  const [done, setDone] = useState(false)
  const submit = ({ password }: Values) => {
    if (!wallet) throw new Error("Wallet is not connected")
    const { name } = wallet
    disconnect()
    deleteWallet({ name, password })
    setDone(true)
  }

  return (
    <Page title={t("Delete wallet")} extra={<GoBack />}>
      <ConnectedWallet>
        <Card>
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
        </Card>
      </ConnectedWallet>
    </Page>
  )
}

export default DeleteWallet
