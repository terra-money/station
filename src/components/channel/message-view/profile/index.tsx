import { useAtom } from "jotai"
import { useEffect, useMemo, useState } from "react"
import Box from "@mui/material/Box"
import { useTheme } from "@mui/material/styles"
import Tooltip from "@mui/material/Tooltip"
import DialogContent from "@mui/material/DialogContent"
import { nip05, nip19 } from "@terra-money/nostr-tools"
import Avatar from "components/channel/message-view/profile/avatar"
import { keysAtom } from "utils/nostr/atoms"
import { Profile } from "types/nostr/index"
import { truncate, truncateMiddle } from "utils/truncate"
import { useTranslation } from "react-i18next"
import Check from "@mui/icons-material/Check"
import Key from "@mui/icons-material/Key"

const ProfileDialog = (props: { profile?: Profile; pubkey: string }) => {
  const { profile, pubkey } = props
  const [keys] = useAtom(keysAtom)
  const theme = useTheme()
  const { t } = useTranslation()
  const [nip05Verified, setNip05Verified] = useState<boolean>(false)

  const profileName = useMemo(
    () => (profile?.name ? truncateMiddle(profile.name, 22, ":") : null),
    [profile]
  )
  const pub = useMemo(() => nip19.npubEncode(pubkey), [pubkey])
  const isMe = keys?.pub === pubkey

  const boxSx = {
    position: "absolute",
    top: "4px",
    zIndex: 2,
    padding: "3px",
    borderRadius: theme.shape.borderRadius,
    background: theme.palette.background.paper,
    width: "36px",
    height: "36px",
  }

  useEffect(() => {
    if (!profile?.nip05) return
    nip05.queryProfile(profile.nip05).then((resp) => {
      setNip05Verified(resp?.pubkey === profile.creator)
    })
  }, [profile])

  return (
    <>
      <DialogContent>
        <Box sx={{ fontSize: "0.8em" }}>
          <Box
            sx={{
              mb: "10px",
              display: "flex",
              position: "relative",
              height: "200px",
              width: "200px",
              margin: "auto",
            }}
          >
            {nip05Verified && (
              <Box sx={{ ...boxSx, left: "4px" }}>
                <Tooltip title={t("NIP-05 verified")}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                    }}
                  >
                    <Check height={18} />
                  </Box>
                </Tooltip>
              </Box>
            )}
            <Box
              sx={{
                position: "absolute",
                left: 0,
                top: 0,
                zIndex: 1,
              }}
            >
              <Avatar src={profile?.picture} seed={pubkey} size={200} />
            </Box>
          </Box>
          <Box sx={{ textAlign: "center", mt: "12px" }}>
            {profileName && (
              <Box sx={{ mb: "10px", fontWeight: 600, fontSize: "1.2em" }}>
                {profileName}
              </Box>
            )}
            {profile?.about && (
              <Box
                sx={{
                  mb: "10px",
                  wordBreak: "break-word",
                  lineHeight: "1.4em",
                  color: theme.palette.text.secondary,
                }}
              >
                {truncate(profile.about, 160)}
              </Box>
            )}
            <Box
              sx={{
                mb: "16px",
                fontSize: "0.9em",
                color: theme.palette.text.secondary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <Box
                sx={{
                  mr: "4px",
                  display: "flex",
                  color: theme.palette.warning.main,
                }}
              >
                <Key height={14} />
              </Box>
              {truncateMiddle(pub, 20, "...")}
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </>
  )
}

export default ProfileDialog
