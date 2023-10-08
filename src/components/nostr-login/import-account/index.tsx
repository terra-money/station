import React, { useState } from "react"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogTitle from "@mui/material/DialogTitle"
import { Box, TextField } from "@mui/material"
import { nip19 } from "@terra-money/nostr-tools"
import { DecodeResult } from "@terra-money/nostr-tools/lib/nip19"

import useModal from "utils/hooks/use-modal"
import { useTranslation } from "react-i18next"
import Close from "@mui/icons-material/Close"
import styles from "./ImportAccount.module.scss"
import { Button, ExternalLink } from "components/general"

const ImportAccount = (props: {
  onSuccess: (key: string, type: "pub" | "priv") => void
}) => {
  const { onSuccess } = props
  const [, showModal] = useModal()
  const { t } = useTranslation()
  const [userKey, setUserKey] = useState("")
  const [isInvalid, setIsInvalid] = useState(false)

  const handleClose = () => {
    showModal(null)
  }

  const handleSubmit = () => {
    if (userKey.startsWith("nsec") || userKey.startsWith("npub")) {
      let dec: DecodeResult
      try {
        dec = nip19.decode(userKey)
      } catch (e) {
        setIsInvalid(true)
        return
      }

      const key = dec.data as string
      if (dec.type === "nsec") {
        onSuccess(key, "priv")
      } else if (dec.type === "npub") {
        onSuccess(key, "pub")
      } else {
        setIsInvalid(true)
      }
    } else {
      setIsInvalid(true)
    }
  }

  const handleUserKeyChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setUserKey(e.target.value)
    setIsInvalid(false)
  }

  return (
    <Box className={styles.ImportAccountDialogWrapper}>
      <DialogTitle className={styles.ImportAccountDialogTitle}>
        {t("Import Account")}
        <Close height={22} onClick={handleClose} />
      </DialogTitle>

      <DialogContent className={styles.ImportAccountDialogContent}>
        <TextField
          fullWidth
          autoComplete="off"
          autoFocus
          value={userKey}
          onChange={handleUserKeyChange}
          placeholder={t("Enter nostr private key")}
          error={isInvalid}
          inputProps={{
            autoCorrect: "off",
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSubmit()
            }
          }}
        />
        <Box className={styles.ImportAccountInputFooter}>
          <span className={styles.InvalidText}>
            {isInvalid && t("Invalid key")}
          </span>
          <span>
            <ExternalLink icon href="https://nostr.com/get-started">
              {t("More info about Nostr keys")}
            </ExternalLink>
          </span>
        </Box>
      </DialogContent>

      <DialogActions className={styles.ImportAccountFooter}>
        <Button onClick={handleClose}>{t("Cancel")}</Button>

        <Button
          color={isInvalid ? "default" : "primary"}
          onClick={handleSubmit}
        >
          {t("Import")}
        </Button>
      </DialogActions>
    </Box>
  )
}

export default ImportAccount
