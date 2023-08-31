import { useTranslation } from "react-i18next"
import { ModalButton } from "components/feedback"
import { Button } from "components/general"
import is from "auth/scripts/is"
import CoinTypePasswordForm from "./CoinTypePasswordForm"
import { useState } from "react"
import { useAuth } from "auth"
import CoinTypeMnemonicForm from "./CoinTypeMnemonicForm"

const EnableCoinType = () => {
  const { t } = useTranslation()
  const { wallet } = useAuth()

  const [modalKey, setModalKey] = useState(0)
  const closeModal = () => setModalKey((k) => k + 1)

  // if wallet is ledger or multisig, return null
  if (!wallet || is.ledger(wallet) || is.multisig(wallet)) return null
  // if wallet already has injective address enabled, return null
  if (wallet.words?.["60"]) return null

  return (
    <ModalButton
      modalKey={modalKey.toString()}
      title={t("Enable Injective")}
      renderButton={(open) => (
        <Button size="small" color="primary" onClick={open}>
          Enable Injective
        </Button>
      )}
    >
      {is.seed(wallet) ? (
        <CoinTypePasswordForm close={closeModal} />
      ) : (
        <CoinTypeMnemonicForm close={closeModal} />
      )}
    </ModalButton>
  )
}

export default EnableCoinType
