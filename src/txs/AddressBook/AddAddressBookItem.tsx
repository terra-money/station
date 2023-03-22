import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useForm } from "react-hook-form"
import PersonIcon from "@mui/icons-material/Person"
import { truncate } from "@terra-money/terra-utils"
import { useAddressBook } from "data/settings/AddressBook"
import { useTnsAddress } from "data/external/tns"
import { InlineFlex } from "components/layout"
import { Form, FormItem, Submit, Input } from "components/form"
import { Fetching } from "components/feedback"
import validate from "txs/validate"

const AddAddressBookItem = ({ close }: { close: () => void }) => {
  const { t } = useTranslation()
  const { add, validateName } = useAddressBook()

  /* form */
  const form = useForm<AddressBook>({ mode: "onChange" })
  const { register, watch, setError, handleSubmit, formState } = form
  const { errors } = formState
  const { recipient } = watch()

  const submit = (values: AddressBook) => {
    add(values)
    close()
  }

  /* resolve recipient */
  const { data: resolvedAddress, ...tnsState } = useTnsAddress(recipient ?? "")

  // validate(tns): not found
  const invalid =
    recipient?.endsWith(".ust") && !tnsState.isLoading && !resolvedAddress
      ? t("Address not found")
      : ""

  const disabled =
    invalid || (tnsState.isLoading && t("Searching for address..."))

  useEffect(() => {
    if (invalid) setError("recipient", { type: "invalid", message: invalid })
  }, [invalid, setError])

  const renderResolvedAddress = () => {
    if (!resolvedAddress) return null
    return (
      <InlineFlex gap={4} className="success">
        <PersonIcon fontSize="inherit" />
        {truncate(resolvedAddress)}
      </InlineFlex>
    )
  }

  return (
    <Fetching isFetching={tnsState.isLoading}>
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
          />
        </FormItem>

        <FormItem
          label={t("Address")}
          extra={renderResolvedAddress()}
          error={errors.recipient?.message}
        >
          <Input
            {...register("recipient", { validate: validate.recipient() })}
          />
        </FormItem>

        <FormItem
          label={`${t("Memo")} (${t("optional")})`}
          error={errors.memo?.message}
        >
          <Input
            {...register("memo", {
              validate: {
                size: validate.size(256),
                bracket: validate.memo(),
              },
            })}
          />
        </FormItem>

        <Submit disabled={!!disabled}>{disabled}</Submit>
      </Form>
    </Fetching>
  )
}

export default AddAddressBookItem
