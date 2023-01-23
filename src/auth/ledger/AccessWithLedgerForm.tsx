import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import UsbIcon from "@mui/icons-material/Usb"
import BluetoothIcon from "@mui/icons-material/Bluetooth"
import { LedgerKey } from "@terra-money/ledger-station-js"
import {
  Form,
  FormError,
  FormHelp,
  FormItem,
  FormWarning,
} from "components/form"
import { Checkbox, Input, Submit } from "components/form"
import validate from "../scripts/validate"
import useAuth from "../hooks/useAuth"
import { createBleTransport, isBleAvailable } from "utils/ledger"
import { wordsFromAddress } from "utils/bech32"

import Lottie from "lottie-react"
import connect from "./assets/connect.json"
import openApp from "./assets/openApp.json"
import { Button } from "components/general"

import styles from "./AccessWithLedger.module.scss"
import { FlexColumn } from "components/layout"
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
  askCosmos = "askCosmos",
  openCosmos = "openCosmos",
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

  const connectTerra = async () => {
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
      setWords({ "330": wordsFromAddress(key330.accAddress("terra")) })
      setPage(Pages.askCosmos)
    } catch (error) {
      setError(error as Error)
      setPage(Pages.form)
    }
  }

  const connectCosmos = async () => {
    setError(undefined)
    try {
      // wait until ledger is connected
      setPage(Pages.connect)
      // TODO: might want to use 118 on terra too
      const key118 = await LedgerKey.create({
        transport: bluetooth ? createBleTransport : undefined,
        index,
        coinType: 118,
        onConnect: () => setPage(Pages.openCosmos),
      })
      setWords((w) => ({
        ...w,
        "118": wordsFromAddress(key118.accAddress("terra")),
      }))
      setPage(Pages.complete)
    } catch (error) {
      setError(error as Error)
      setPage(Pages.askCosmos)
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
            <Button color="primary" onClick={connectTerra}>
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
      case Pages.askCosmos:
        return (
          <>
            <>
              <section className="center">
                <p>{t("Do you want to import your Cosmos accounts?")}</p>
                <FlexColumn gap={4} className={styles.warningContainer}>
                  <FormHelp>
                    {t(
                      "You will need the Cosmos app installed on your Ledger."
                    )}
                    <br />
                    {t(
                      "The device will try to open the cosmos app automatically."
                    )}
                  </FormHelp>
                  {error && <FormError>{error.message}, try again.</FormError>}
                </FlexColumn>

                <Button
                  className={styles.mainButton}
                  color="primary"
                  onClick={connectCosmos}
                >
                  {t("Yes")}
                </Button>
                <p>
                  <button
                    className={styles.smallButton}
                    onClick={() => setPage(Pages.complete)}
                  >
                    {t("No, I'll use only Terra")}
                  </button>
                </p>
              </section>
            </>
          </>
        )
      case Pages.openCosmos:
        return (
          <>
            <>
              <section className="center">
                <Lottie animationData={openApp} />
                <p>
                  Open the <strong>Cosmos app</strong> on the Ledger device.
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
