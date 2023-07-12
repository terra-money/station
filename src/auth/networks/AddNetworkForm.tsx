import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { useNetworkState } from "data/wallet"
import { useCustomNetworks } from "data/settings/CustomNetworks"
import { Form, FormItem, Submit, Input, Checkbox } from "components/form"
import { CustomNetwork } from "types/network"

const AddNetwork = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  //const { mainnet } = useNetworks()
  const mainnet = {
    name: "mainnet",
    chainID: "phoenix-1",
    lcd: "https://phoenix-lcd.terra.dev",
  }
  const [, setNetwork] = useNetworkState()
  const { add, validateName } = useCustomNetworks()

  /* form */
  const form = useForm<CustomNetwork>({ mode: "onChange" })
  const { register, watch, handleSubmit, formState } = form
  const { errors, isValid } = formState
  const { preconfigure } = watch()

  const submit = (values: CustomNetwork) => {
    add(values)
    setNetwork(values.name)
    navigate("/")
  }

  return (
    <Form onSubmit={handleSubmit(submit)}>
      <FormItem label={t("Name")} error={errors.name?.message}>
        <Input
          {...register("name", {
            required: true,
            validate: {
              exists: (value) =>
                !validateName(value) ? `${value} already exists` : undefined,
            },
          })}
          placeholder={mainnet.name}
          autoFocus
        />
      </FormItem>

      <FormItem label={t("Chain ID")} error={errors?.chainID?.message}>
        <Input
          {...register("chainID", { required: true })}
          placeholder={mainnet?.chainID}
        />
      </FormItem>

      <FormItem label={t("LCD")} error={errors.lcd?.message}>
        <Input
          {...register("lcd", { required: true })}
          placeholder={mainnet.lcd}
        />
      </FormItem>

      <Checkbox {...register("preconfigure")} checked={preconfigure}>
        {t("Preconfigure accounts")}
      </Checkbox>

      <Submit disabled={!isValid} />
    </Form>
  )
}

export default AddNetwork
