import { useEffect, useState } from "react"
import { useAtom } from "jotai"
import Box from "@mui/material/Box"
import Divider from "@mui/material/Divider"
import Button from "@mui/material/Button"
import CircularProgress from "@mui/material/CircularProgress"
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
import { ImportContacts } from "@mui/icons-material"

const NostrLogin = () => {
  const { t } = useTranslation()
  const [, showModal] = useModal()
  const [, setKeys] = useAtom(keysAtom)
  const [profile, setProfile] = useAtom(profileAtom)
  const [, setBackupWarn] = useAtom(backupWarnAtom)
  const [raven] = useAtom(ravenAtom)
  const [ravenReady] = useAtom(ravenReadyAtom)
  const [step, setStep] = useState<0 | 1 | 2>(0)

  useEffect(() => {
    if (step === 1 && ravenReady) setStep(2)
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

  const loginNip07 = async () => {
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
      setStep(1)
    })
  }

  return (
    <>
      <Divider sx={{ m: "28px 0" }} />
      {(() => {
        if (step === 1) {
          return (
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <CircularProgress />
            </Box>
          )
        }

        if (step === 2) {
          return (
            <>
              <Box sx={{ color: "text.secondary", mb: "28px" }}>
                {t("Setup your profile")}
              </Box>
              <MetadataForm
                skipButton={<Button>{t("Skip")}</Button>}
                submitBtnLabel={t("Finish")}
                onSubmit={(data: any) => {
                  raven?.updateProfile(data)
                }}
              />
            </>
          )
        }

        return (
          <>
            <Box sx={{ color: "text.secondary", mb: "28px" }}>
              {t("Sign in to get started")}
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Button
                size="large"
                disableElevation
                fullWidth
                onClick={createAccount}
                sx={{
                  mb: "22px",
                  p: "20px 26px",
                  mr: "22px",
                }}
                startIcon={<Add width={38} />}
              >
                {t("Create Nostr Account")}
              </Button>
              <Button
                size="large"
                disableElevation
                fullWidth
                onClick={importAccount}
                sx={{ mb: "22px", p: "20px 26px" }}
                startIcon={<ImportContacts width={38} />}
              >
                {t("Import Nostr Account")}
              </Button>
            </Box>
            <Button
              disabled
              size="large"
              disableElevation
              fullWidth
              onClick={loginNip07}
              sx={{ p: "14px" }}
              startIcon={<AccountBalanceWalletIcon height={20} />}
            >
              {t("Use NIP-07 Wallet")}
            </Button>
          </>
        )
      })()}
    </>
  )
}

export default NostrLogin
