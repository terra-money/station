import { Form } from "components/form"
import { useSwapForm } from "./hooks/useSwapForm"
import { SwapFormFields } from "./SwapFormFields"

/*
TODO:
- [ ] reuse ChainInput and ChainSelector
- [ ] isValid only when ask and offer assets

TODO for SelectToken:
- [ ] group tokens into "Coins" and "Tokens"
- [ ] show loader when fetching tokens
- [ ] show icon for token
- [ ] show token name
- [ ] show token balance
- [ ] refactor

TODO for ChainInput:
- [ ] close on click outside
- [ ] second chain input has small height
- [ ] show balance of offer token

TODO from TFMSwapForm:
- [ ] placeholder for offer input
- [ ] options for offer input
- [ ] options for ask input
- [ ] take offer asset from useLocation()
- [ ] extra (max) for the amount input
- [ ] empty opposite asset if select the same asset
- [ ] validate amount against max and offerDecimals
- [ ] max reset on focus
- [ ] simulate value
- [ ] calculate and display fee

TODO from Tx component:
- [ ] use Tx component and submit button when it's a one step swap

Notes:
1. Use [floating-ui](https://github.com/floating-ui/floating-ui) for popovers and click outside
*/

export const SwapForm = () => {
  const form = useSwapForm()

  const { handleSubmit } = form

  return (
    <Form
      onSubmit={handleSubmit((values) => {
        console.log(values)
      })}
    >
      <SwapFormFields form={form} />
    </Form>
  )
}
