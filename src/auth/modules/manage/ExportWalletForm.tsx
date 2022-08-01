import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useForm } from "react-hook-form"
import { Pre } from "components/general"
import { Grid } from "components/layout"
import { Form, FormItem, FormWarning } from "components/form"
import { Input, RadioButton, Submit } from "components/form"
import { Modal, Mode as ModalMode } from "components/feedback"
import QRCode from "../../components/QRCode"
import { isWallet, useAuth } from "auth"
import ConfirmModal from "./ConfirmModal"

enum Mode {
  QR = "QR code",
  KEY = "Private key",
}

interface Values {
  mode: Mode
  password: string
}

const ExportWalletForm = () => {
  const { t } = useTranslation()
  const {
    validatePassword,
    encodeEncryptedWallet,
    decodeBioAuthKey,
    isUseBio,
  } = useAuth()

  /* form */
  const form = useForm<Values>({
    mode: "onChange",
    defaultValues: { mode: Mode.QR },
  })

  const { register, watch, handleSubmit, formState } = form
  const { errors } = formState
  const { mode } = watch()
  const [isFailBio, setIsFailBio] = useState(false)
  const [bioWithPassword, setBioWithPassword] = useState(false)

  /* submit */
  const [encoded, setEncoded] = useState<string>()
  const submit = async ({ password }: Values) => {
    try {
      if (isUseBio && !bioWithPassword) {
        const bioKey = await decodeBioAuthKey()
        if (bioKey) {
          const encoded = encodeEncryptedWallet(bioKey)
          setEncoded(encoded)
        } else {
          // suggest to input password
          setIsFailBio(true)
        }
      } else {
        const encoded = encodeEncryptedWallet(password)
        setEncoded(encoded)
      }
    } catch (error) {
      if (
        error instanceof Error &&
        error?.message === "Failed bio authentication."
      ) {
        setIsFailBio(true)
      }
    }
  }

  /* reset */
  const reset = () => {
    form.reset()
    setEncoded(undefined)
  }

  /* render */
  const render = {
    [Mode.QR]: () => (
      <QRCode value={`terrastation://wallet_recover/?payload=${encoded}`} />
    ),
    [Mode.KEY]: () => (
      <Pre normal break copy>
        {encoded}
      </Pre>
    ),
  }

  return (
    <>
      {encoded && (
        <Modal
          title={mode}
          isOpen
          onRequestClose={reset}
          modalType={isWallet.mobile() ? ModalMode.FULL : ModalMode.DEFAULT}
        >
          <Grid gap={20}>
            <FormWarning>{t("Keep this private")}</FormWarning>
            {render[mode]()}
          </Grid>
        </Modal>
      )}

      <Form onSubmit={handleSubmit(submit)}>
        <section>
          {Object.values(Mode).map((key) => {
            const checked = mode === key

            return (
              <RadioButton
                {...register("mode")}
                value={key}
                checked={checked}
                key={key}
              >
                {key}
              </RadioButton>
            )
          })}
        </section>

        {!(isUseBio && !bioWithPassword) && (
          <FormItem label={t("Password")} error={errors.password?.message}>
            <Input
              {...register("password", { validate: validatePassword })}
              type="password"
              autoFocus
            />
          </FormItem>
        )}

        <Submit />
      </Form>

      {isFailBio && (
        <ConfirmModal
          onRequestClose={() => {
            setBioWithPassword(true)
            setIsFailBio(false)
          }}
        >
          {t("Would you like to confirm with your password?")}
        </ConfirmModal>
      )}
    </>
  )
}

export default ExportWalletForm
