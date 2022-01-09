import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { useNetworkState } from "data/wallet"
import { useCustomNetworks } from "data/settings/CustomNetworks"
import { Form, FormItem, Submit, Input } from "components/form"
import { useNetworks } from "app/NetworksProvider"

const AddNetwork = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { mainnet } = useNetworks()
  const [, setNetwork] = useNetworkState()
  const { add, validateName } = useCustomNetworks()

  /* form */
  const form = useForm<TerraNetwork>({ mode: "onChange" })
  const { register, handleSubmit, formState } = form
  const { errors } = formState

  const submit = (values: TerraNetwork) => {
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

      <FormItem label={t("Chain ID")} error={errors.chainID?.message}>
        <Input
          {...register("chainID", { required: true })}
          placeholder={mainnet.chainID}
        />
      </FormItem>

      <FormItem label={t("LCD")} error={errors.lcd?.message}>
        <Input
          {...register("lcd", { required: true })}
          placeholder={mainnet.lcd}
        />
      </FormItem>

      <Submit />
    </Form>
  )
}

export default AddNetwork
