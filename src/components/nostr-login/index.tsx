import { useEffect, useState } from "react"
import { useAtom } from "jotai"
import Box from "@mui/material/Box"
import { Button, ExternalLink } from "components/general"
import { nip06, getPublicKey } from "@terra-money/nostr-tools"
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet"
import ImportAccount from "components/nostr-login/import-account"
import MetadataForm from "components/nostr-login/metadata-form"
import {
  keysAtom,
  profileAtom,
  backupWarnAtom,
  ravenAtom,
  ravenReadyAtom,
} from "utils/nostr/atoms"
import { storeKeys } from "utils/localStorage/nostr"
import { Keys } from "types/nostr"
import { useTranslation } from "react-i18next"
import useModal from "utils/hooks/use-modal"
import Add from "@mui/icons-material/Add"
import { Login } from "@mui/icons-material"
import { Card } from "components/layout"
import styles from "./NostrLogin.module.scss"

const NostrLogin = () => {
  const { t } = useTranslation()
  const [, showModal] = useModal()
  const [, setKeys] = useAtom(keysAtom)
  const [_, setProfile] = useAtom(profileAtom)
  const [, setBackupWarn] = useAtom(backupWarnAtom)
  const [raven] = useAtom(ravenAtom)
  const [ravenReady] = useAtom(ravenReadyAtom)
  const [step, setStep] = useState<0 | 1 | 2>(0)

  useEffect(() => {
    if (step === 0 && !ravenReady) setStep(1)
  }, [step, ravenReady])

  const createAccount = () => {
    const priv = nip06.privateKeyFromSeedWords(nip06.generateSeedWords())
    loginPriv(priv)
    setBackupWarn(true)
  }

  const importAccount = () => {
    showModal({
      body: (
        <ImportAccount
          onSuccess={(key: any, type: any) => {
            showModal(null)
            if (type === "priv") {
              loginPriv(key)
            } else if (type === "pub") {
              proceed({ priv: "none", pub: key })
            }
          }}
        />
      ),
    })
  }

  const loginWithStation = async () => {
    if (!window.nostr) {
      // showModal({
      //     body: <InstallNip07Dialog/>
      // });
      return
    }

    const pub = await window.nostr.getPublicKey()
    if (pub) proceed({ priv: "nip07", pub })
  }

  const loginPriv = (priv: string) => {
    const pub = getPublicKey(priv)
    proceed({ priv, pub })
  }

  const proceed = (keys: Keys) => {
    storeKeys(keys).then(() => {
      setKeys(keys)
      setProfile(null)
    })
  }

  return (
    <Card className={styles.NostrLoginWrapper}>
      {step === 1 && (
        <Box>
          <Box className={styles.LoginInfo}>
            <b>{t("Sign in to get started. ")}</b>
            {t("A new set of keys will be needed exclusively for Nostr. ")}
            {t(
              "Nostr wallet is not the same as Terra's wallet but can be bounded to it submitting a transaction on chain. "
            )}
          </Box>

          <Box className={styles.LoginDetailsButtons}>
            <Button onClick={createAccount} icon={<Add />} color="primary">
              {t("Create Nostr Account")}
            </Button>

            <Button onClick={importAccount} icon={<Login />} color="primary">
              {t("Import Nostr Account")}
            </Button>

            <Button
              disabled
              onClick={loginWithStation}
              color="primary"
              icon={<AccountBalanceWalletIcon />}
            >
              {t("Use Station Wallet (coming soon)")}
            </Button>
          </Box>

          <Box className={styles.LoginInfoFooter}>
            <ExternalLink icon href="https://nostr.com/#simple">
              {t("Learn more about Nostr")}
            </ExternalLink>
          </Box>
        </Box>
      )}

      {step === 2 && (
        <>
          <Box>{t("Setup your profile")}</Box>
          <MetadataForm
            skipButton={<Button>{t("Skip")}</Button>}
            submitBtnLabel={t("Finish")}
            onSubmit={(data: any) => {
              raven?.updateProfile(data)
            }}
          />
        </>
      )}
    </Card>
  )
}

export default NostrLogin
