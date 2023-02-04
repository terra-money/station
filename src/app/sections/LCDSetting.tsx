import { useNetworkName, useNetworkOptions } from "data/wallet"
import { useForm } from "react-hook-form"
import { Form, FormItem, Input, Select } from "components/form"
import { useTranslation } from "react-i18next"
import { useNetworks } from "app/InitNetworks"
import ChainSelector from "components/form/ChainSelector"
import { useEffect, useMemo } from "react"
import { Button } from "components/general"
import styles from "./LCDSetting.module.scss"
import { useValidateLCD } from "data/queries/tendermint"
import { LoadingCircular } from "components/feedback"
import ClearIcon from "@mui/icons-material/Clear"
import CheckIcon from "@mui/icons-material/Check"
import { Flex } from "components/layout"
import { useCustomLCDs } from "utils/localStorage"

interface FormValues {
  network: string
  chainID: string
  lcd?: string
}

const LCDSetting = () => {
  const networkName = useNetworkName()
  const networkOptions = useNetworkOptions()
  const { networks } = useNetworks()
  const { t } = useTranslation()
  const { customLCDs, changeCustomLCDs } = useCustomLCDs()

  const form = useForm<FormValues>({ mode: "onChange" })
  const {
    register,
    //trigger,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = form
  const { network, chainID, lcd } = watch()
  const networksList = useMemo(
    () =>
      Object.values(networks[network] ?? {})
        .sort((a, b) => {
          if (a.prefix === "terra") return -1
          if (b.prefix === "terra") return 1
          return 0
        })
        .map(({ chainID }) => chainID),
    [networks, network]
  )

  useEffect(() => {
    setValue("chainID", networksList[0])
  }, [setValue, networksList])

  useEffect(() => {
    setValue("lcd", customLCDs[chainID] ?? "")
  }, [setValue, customLCDs, chainID])

  const { data: errorMessage, isLoading } = useValidateLCD(
    lcd,
    chainID,
    customLCDs[chainID] !== lcd
  )

  const isDisabled = !!errorMessage || isLoading
  const isSaved = (!customLCDs[chainID] && !lcd) || customLCDs[chainID] === lcd

  if (!networkOptions) return null

  function renderIsValidLCD() {
    if (!lcd) {
      return
    } else if (isLoading) {
      return (
        <span className={styles.loading}>
          <Flex gap={4} start>
            <LoadingCircular size={10} /> Loading...
          </Flex>
        </span>
      )
    } else if (errorMessage) {
      return (
        <span className={styles.error}>
          <Flex gap={4} start>
            <ClearIcon fontSize="inherit" className={styles.icon} />
            Invalid
          </Flex>
        </span>
      )
    } else {
      return (
        <span className={styles.success}>
          <Flex gap={4} start>
            <CheckIcon fontSize="inherit" className={styles.icon} />
            Valid
          </Flex>
        </span>
      )
    }
  }

  function submit({ chainID, lcd }: FormValues) {
    if (isDisabled) return

    changeCustomLCDs(chainID, lcd)
  }

  function reset(chainID: string) {
    changeCustomLCDs(chainID, undefined)
    setValue("lcd", undefined)
  }

  return (
    <Form onSubmit={handleSubmit(submit)}>
      <FormItem label={t("Network")} error={errors.network?.message}>
        <Select
          {...register("network", {
            value: networkName,
          })}
          autoFocus
        >
          {networkOptions.map(({ value, label }) => (
            <option value={value} key={value}>
              {label}
            </option>
          ))}
        </Select>
      </FormItem>

      <FormItem label={t("Chain")} error={errors.chainID?.message}>
        <ChainSelector
          chainsList={networksList}
          value={chainID}
          onChange={(chainID) => setValue("chainID", chainID)}
          small
        />
      </FormItem>

      <FormItem
        label={t("LCD URL")}
        error={errorMessage}
        extra={renderIsValidLCD()}
      >
        <Input
          type="text"
          placeholder={networks[network]?.[chainID]?.lcd}
          actionButton={
            lcd || !isSaved
              ? {
                  icon: <span className={styles.loading}>Reset</span>,
                  onClick: () => reset(chainID),
                }
              : undefined
          }
          {...register("lcd", {
            value: customLCDs[chainID] ?? "",
          })}
        />
      </FormItem>
      <div className={styles.button__padding}></div>
      <section className={styles.button__conainer}>
        <Button color="primary" disabled={isDisabled || isSaved} type="submit">
          {isLoading ? (
            <>
              <LoadingCircular size={18} /> Loading...
            </>
          ) : (
            <>Save</>
          )}
        </Button>
      </section>
    </Form>
  )
}

export default LCDSetting
