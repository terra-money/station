import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useForm } from "react-hook-form"
import QRCode from "qrcode.react"
import variable from "styles/variable"
import { Pre } from "components/general"
import { Card, Flex, Grid, Page } from "components/layout"
import { Form, FormItem, FormWarning } from "components/form"
import { Input, RadioButton, Submit } from "components/form"
import { Modal } from "components/feedback"
import useAuth from "../../hooks/useAuth"
import ConnectedWallet from "./ConnectedWallet"
import GoBack from "./GoBack"

enum Mode {
  QR = "QR code",
  KEY = "Private key",
}

interface Values {
  mode: Mode
  password: string
}

const ExportWallet = () => {
  const { t } = useTranslation()
  const { validatePassword, encodeEncryptedWallet } = useAuth()

  /* form */
  const form = useForm<Values>({
    mode: "onChange",
    defaultValues: { mode: Mode.QR },
  })

  const { register, watch, handleSubmit, formState } = form
  const { errors } = formState
  const { mode } = watch()

  /* submit */
  const [encoded, setEncoded] = useState<string>()
  const submit = ({ password }: Values) => {
    const encoded = encodeEncryptedWallet(password)
    setEncoded(encoded)
  }

  /* reset */
  const reset = () => {
    form.reset()
    setEncoded(undefined)
  }

  /* render */
  const render = {
    [Mode.QR]: () => (
      <Flex>
        <QRCode
          value={`terrastation://wallet_recover/?payload=${encoded}`}
          size={320}
          bgColor={variable("--card-bg")}
          fgColor={variable("--text")}
          renderAs="svg"
        />
      </Flex>
    ),
    [Mode.KEY]: () => (
      <Pre normal break copy>
        {encoded}
      </Pre>
    ),
  }

  return (
    <Page title={t("Export wallet")} extra={<GoBack />}>
      {encoded && (
        <Modal title={mode} isOpen onRequestClose={reset}>
          <Grid gap={20}>
            <FormWarning>{t("Keep this private")}</FormWarning>
            {render[mode]()}
          </Grid>
        </Modal>
      )}

      <ConnectedWallet>
        <Card>
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

            <FormItem label={t("Password")} error={errors.password?.message}>
              <Input
                {...register("password", { validate: validatePassword })}
                type="password"
                autoFocus
              />
            </FormItem>

            <Submit />
          </Form>
        </Card>
      </ConnectedWallet>
    </Page>
  )
}

export default ExportWallet
