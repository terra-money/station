import { useMemo } from "react"
import { MnemonicKey } from "@terra-rebels/terra.js"
import CreateWalletWizard from "./CreateWalletWizard"
import Quiz from "./Quiz"

const NewWalletForm = () => {
  const { mnemonic } = useMemo(() => new MnemonicKey(), []) // must be memoized

  return (
    <CreateWalletWizard defaultMnemonic={mnemonic} beforeCreate={<Quiz />} />
  )
}

export default NewWalletForm
