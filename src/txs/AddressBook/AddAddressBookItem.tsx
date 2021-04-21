import { useTranslation } from "react-i18next"
import { useForm } from "react-hook-form"
import { useAddressBook } from "data/settings/AddressBook"
import { Form, FormItem, Submit, Input } from "components/form"
import { useModal } from "components/feedback"
import validate from "txs/validate"

const AddAddressBookItem = () => {
  const { t } = useTranslation()
  const close = useModal()
  const { add, validateName } = useAddressBook()

  /* form */
  const form = useForm<AddressBook>({ mode: "onChange" })
  const { register, handleSubmit, formState } = form
  const { errors } = formState

  const submit = (values: AddressBook) => {
    add(values)
    close()
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
        />
      </FormItem>

      <FormItem label={t("Address")} error={errors.recipient?.message}>
        <Input
          {...register("recipient", {
            required: true,
            validate: {
              recipient: validate.address(),
            },
          })}
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

      <Submit />
    </Form>
  )
}

export default AddAddressBookItem
