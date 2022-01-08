import CreateWalletWizard from "./CreateWalletWizard"
import SelectAddress from "./SelectAddress"

const RecoverWalletForm = () => {
  return <CreateWalletWizard beforeCreate={<SelectAddress />} />
}

export default RecoverWalletForm
