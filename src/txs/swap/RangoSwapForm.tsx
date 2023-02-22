import { Form } from "components/form"
import { useSwapForm } from "./hooks/useSwapForm"
import { SwapFormFields } from "./SwapFormFields"

export const RangoSwapForm = () => {
  const form = useSwapForm()
  const { handleSubmit } = form

  return (
    <Form onSubmit={handleSubmit(console.log)}>
      <SwapFormFields form={form} />
    </Form>
  )
}
