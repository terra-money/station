import { useState } from "react"
import { useTranslation } from "react-i18next"
import { LegacyAminoMultisigPublicKey } from "@terra-money/terra.js"
import { useAddress } from "data/wallet"
import { useAccountInfo } from "data/queries/auth"
import { Card, Grid, Page } from "components/layout"
import { FormHelp } from "components/form"
import { Wrong } from "components/feedback"
import TxContext from "txs/TxContext"
import { isWallet, useAuth } from "auth"
import CreateMultisigWalletForm from "auth/modules/create/CreateMultisigWalletForm"
import ConfirmModal from "auth/modules/manage/ConfirmModal"
import useDefaultValues from "./utils/useDefaultValues"
import PostMultisigTxForm from "./PostMultisigTxForm"

const PostMultisigTxPage = () => {
  const { t } = useTranslation()
  const address = useAddress()
  const { wallet } = useAuth()

  /* account info */
  const { data: account, ...state } = useAccountInfo()

  /* public key from network */
  const [publicKeyFromNetwork, setPublicKeyFromNetwork] =
    useState<LegacyAminoMultisigPublicKey>()
  const [errorMessage, setErrorMessage] = useState<string>()

  const onCreated = (publicKey: LegacyAminoMultisigPublicKey) => {
    if (publicKey.address() !== address)
      setErrorMessage(t("Data does not match the connected wallet"))
    else setPublicKeyFromNetwork(publicKey)
  }

  /* render */
  const defaultValues = useDefaultValues()
  const render = () => {
    if (!(account && address)) return null

    if (!isWallet.multisig(wallet))
      return (
        <Card>
          <Wrong>{t("Connect a multisig wallet to post a multisig tx")}</Wrong>
        </Card>
      )

    const publicKey = account.getPublicKey() ?? publicKeyFromNetwork
    const sequence = account.getSequenceNumber()

    if (!(publicKey instanceof LegacyAminoMultisigPublicKey))
      return (
        <Card>
          <Grid gap={4}>
            <FormHelp>
              {t(
                "This multisig wallet has no transaction history. The addresses and the threshold must be submitted again until a transaction history exist for this wallet."
              )}
            </FormHelp>
            <CreateMultisigWalletForm onCreated={onCreated} />
          </Grid>

          {errorMessage && (
            <ConfirmModal onRequestClose={() => setErrorMessage(undefined)}>
              {errorMessage}
            </ConfirmModal>
          )}
        </Card>
      )

    const signatures = publicKey.pubkeys.map((pubKey) => {
      const address = pubKey.address()
      const publicKey = pubKey.toData()
      return { address, publicKey, signature: "" }
    })

    return (
      <PostMultisigTxForm
        publicKey={publicKey}
        sequence={sequence}
        defaultValues={{ ...defaultValues, address, signatures }}
      />
    )
  }

  const publicKey = account?.getPublicKey() ?? publicKeyFromNetwork
  return (
    <Page {...state} title={t("Post a multisig tx")} small={!publicKey}>
      <TxContext>{render()}</TxContext>
    </Page>
  )
}

export default PostMultisigTxPage
