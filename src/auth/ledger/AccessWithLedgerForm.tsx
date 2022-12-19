import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import UsbIcon from "@mui/icons-material/Usb"
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
import complete from "./assets/complete.json"
import { Button } from "components/general"

import styles from "./AccessWithLedger.module.scss"

interface Values {
  index: number
  bluetooth: boolean
}

enum Pages {
  form = "form",
  connect = "connect",
  openTerra = "openTerra",
  askCosmos = "askCosmos",
  openCosmos = "openCosmos",
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
  const { errors } = formState
  const { index, bluetooth } = watch()

  const submit = async ({ index, bluetooth }: Values) => {
    setError(undefined)
    connectLedger(words, index, bluetooth)
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
              <UsbIcon style={{ fontSize: 56 }} />
              <p>{t("Plug in a Ledger device")}</p>
            </section>

            <FormItem /* do not translate this */
              label="Index"
              error={errors.index?.message}
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
                <p>{t("Open the Terra app")}</p>
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

                {error && <FormError>{error.message}</FormError>}

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
                <p>{t("Open the Cosmos app")}</p>
              </section>
            </>
          </>
        )
      case Pages.complete:
        return (
          <>
            <>
              <section className="center">
                <Lottie
                  animationData={complete}
                  className={styles.completeAnimation}
                />
                <h1>{t("Done!")}</h1>
                <Submit>{t("Start exploring")}</Submit>
              </section>
            </>
          </>
        )
    }
  }

  return <Form onSubmit={handleSubmit(submit)}>{render()}</Form>
}

export default AccessWithLedgerForm
