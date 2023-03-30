import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import UsbIcon from "@mui/icons-material/Usb"
import BluetoothIcon from "@mui/icons-material/Bluetooth"
import { LedgerKey } from "@terra-money/ledger-station-js"
import { Form, FormError, FormItem, FormWarning } from "components/form"
import { Checkbox, Input, Submit } from "components/form"
import validate from "../scripts/validate"
import useAuth from "../hooks/useAuth"
import { createBleTransport, isBleAvailable } from "utils/ledger"
import { wordsFromAddress } from "utils/bech32"

import Lottie from "lottie-react"
import connect from "./assets/connect.json"
import openApp from "./assets/openApp.json"
import { Button } from "components/general"

import { TooltipIcon } from "components/display"

interface Values {
  index: number
  bluetooth: boolean
  name: string
}

enum Pages {
  form = "form",
  connect = "connect",
  openTerra = "openTerra",
  selectName = "selectName",
  complete = "complete",
}

const AccessWithLedgerForm = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { connectLedger } = useAuth()
  const [error, setError] = useState<Error>()
  const [page, setPage] = useState(Pages.form)
  const [words, setWords] = useState<{ 330: string; 118?: string }>({ 330: "" })

  /* check bluetooth availability */
  const [bleAvailable, setBleAvailable] = useState(false)
  useEffect(() => {
    isBleAvailable().then(setBleAvailable)
  }, [])

  /* form */
  const form = useForm<Values>({
    mode: "onChange",
    defaultValues: { index: 0, bluetooth: false },
  })

  const { register, watch, handleSubmit, formState } = form
  const { errors, isValid, isSubmitting } = formState
  const { index, bluetooth } = watch()

  const submit = async ({ index, bluetooth, name }: Values) => {
    setError(undefined)

    connectLedger(words, index, bluetooth, name)
    navigate("/", { replace: true })
  }

  const connectApp = async () => {
    setError(undefined)
    try {
      // wait until ledger is connected
      setPage(Pages.connect)
      // TODO: might want to use 118 on terra too
      const key330 = await LedgerKey.create({
        transport: bluetooth ? createBleTransport : undefined,
        index,
        onConnect: () => setPage(Pages.openTerra),
      })
      const key118 = await LedgerKey.create({
        transport: bluetooth ? createBleTransport : undefined,
        index,
        coinType: 118,
        onConnect: () => setPage(Pages.openTerra),
      })
      setWords({
        "330": wordsFromAddress(key330.accAddress("terra")),
        "118": wordsFromAddress(key118.accAddress("terra")),
      })
      setPage(Pages.complete)
    } catch (error) {
      setError(error as Error)
      setPage(Pages.form)
    }
  }

  const render = () => {
    switch (page) {
      case Pages.form:
        return (
          <>
            <section className="center">
              {bluetooth ? (
                <>
                  <BluetoothIcon style={{ fontSize: 56 }} />
                  <p>{t("Turn on your Ledger device")}</p>
                </>
              ) : (
                <>
                  <UsbIcon style={{ fontSize: 56 }} />
                  <p>{t("Plug in a Ledger device")}</p>
                </>
              )}
            </section>

            <FormItem /* do not translate this */
              label="Index"
              error={errors.index?.message}
              extra={
                <TooltipIcon
                  content={t("BIP 44 index number. For advanced users only")}
                />
              }
            >
              <Input
                {...register("index", {
                  valueAsNumber: true,
                  validate: validate.index,
                })}
              />

              {index !== 0 && (
                <FormWarning>{t("Default index is 0")}</FormWarning>
              )}

              {bleAvailable && (
                <Checkbox {...register("bluetooth")} checked={bluetooth}>
                  Use Bluetooth
                </Checkbox>
              )}
            </FormItem>

            {error && <FormError>{error.message}</FormError>}
            <Button color="primary" onClick={connectApp}>
              Connect
            </Button>
          </>
        )
      case Pages.connect:
        return (
          <>
            <section className="center">
              <Lottie animationData={connect} />
              <p>{t("Connect and unlock your device")}</p>
            </section>
          </>
        )
      case Pages.openTerra:
        return (
          <>
            <>
              <section className="center">
                <Lottie animationData={openApp} />
                <p>
                  Open the <strong>Terra app</strong> on the Ledger device.
                </p>
              </section>
            </>
          </>
        )
      case Pages.complete:
        return (
          <>
            <>
              <section className="center">
                <FormItem label={t("Wallet name")} error={errors.name?.message}>
                  <Input
                    {...register("name", { validate: validate.name })}
                    placeholder="Ledger"
                    autoFocus
                  />
                </FormItem>
                <Submit disabled={!isValid} submitting={isSubmitting}>
                  {t("Submit")}
                </Submit>
              </section>
            </>
          </>
        )
    }
  }

  return <Form onSubmit={handleSubmit(submit)}>{render()}</Form>
}

export default AccessWithLedgerForm
