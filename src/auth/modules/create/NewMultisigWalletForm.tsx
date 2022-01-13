import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useForm } from "react-hook-form"
import { LegacyAminoMultisigPublicKey } from "@terra-money/terra.js"
import { Form, FormItem } from "components/form"
import { Input, Submit } from "components/form"
import { Modal } from "components/feedback"
import { addWallet } from "../../scripts/keystore"
import validate from "../../scripts/validate"
import CreateMultisigWalletForm from "./CreateMultisigWalletForm"
import CreatedWallet from "./CreatedWallet"

interface Values {
  name: string
}

const NewMultisigWalletForm = () => {
  const { t } = useTranslation()

  /* form */
  const form = useForm<Values>({
    mode: "onChange",
    defaultValues: { name: "" },
  })

  const { register, handleSubmit, formState } = form
  const { errors, isValid } = formState

  /* submit */
  const [publicKey, setPublicKey] = useState<LegacyAminoMultisigPublicKey>()
  const [wallet, setWallet] = useState<MultisigWallet>()

  const submit = async ({ name }: Values) => {
    if (!publicKey) return
    const address = publicKey.address()
    const wallet = { name, address, multisig: true as const }

    addWallet(wallet)
    setWallet(wallet)
  }

  /* render */
  return (
    <>
      {wallet && (
        <Modal isOpen>
          <CreatedWallet {...wallet} />
        </Modal>
      )}

      {publicKey ? (
        <Form onSubmit={handleSubmit(submit)}>
          <FormItem label={t("Wallet name")} error={errors.name?.message}>
            <Input
              {...register("name", { validate: validate.name })}
              autoFocus
            />
          </FormItem>

          <Submit disabled={!isValid} />
        </Form>
      ) : (
        <CreateMultisigWalletForm onCreated={setPublicKey} />
      )}
    </>
  )
}

export default NewMultisigWalletForm
