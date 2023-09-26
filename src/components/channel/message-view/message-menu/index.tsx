import React, { useRef } from "react"
import IconButton from "@mui/material/IconButton"
import Box from "@mui/material/Box"
import Tooltip from "@mui/material/Tooltip"
import { useTheme } from "@mui/material/styles"
import { useAtom } from "jotai"
import { Message } from "types/nostr"
import { Close, InsertEmoticon, RemoveRedEye, Reply } from "@mui/icons-material"
import useModal from "utils/hooks/use-modal"
import EmojiPicker from "components/channel/chat-input/tools/emoji-picker"
import usePopover from "utils/hooks/use-popover"
import { useTranslation } from "react-i18next"
import {
  activeMessageAtom,
  keysAtom,
  ravenAtom,
  threadRootAtom,
} from "utils/nostr/atoms"
import ShortEmojiPicker from "./short-emoji-picker"

const MessageMenu = (props: { message: Message; inThreadView?: boolean }) => {
  const { message, inThreadView } = props
  const theme = useTheme()
  const [keys] = useAtom(keysAtom)
  const [raven] = useAtom(ravenAtom)
  const [, setActiveMessage] = useAtom(activeMessageAtom)
  const [, setThreadRoot] = useAtom(threadRootAtom)
  const [, showModal] = useModal()
  const { t } = useTranslation()
  const [, showPopover] = usePopover()
  const emojiButton = useRef<HTMLButtonElement | null>(null)

  const emojiSelected = (emoji: string) => {
    if (
      message.reactions?.find(
        (x) => x.creator === keys?.pub && x.content === emoji
      ) === undefined
    ) {
      raven
        ?.sendReaction(message.id, message.creator, emoji)
        .catch((e: any) => {
          console.error(e.toString())
        })
    }
    setActiveMessage(null)
    showPopover(null)
  }

  const emoji = () => {
    setActiveMessage(message.id)
    showPopover({
      body: (
        <Box sx={{ width: "280px" }}>
          <ShortEmojiPicker onSelect={emojiSelected} onMore={emojiFull} />
        </Box>
      ),
      toRight: true,
      toBottom: true,
      anchorEl: emojiButton.current!,
      onClose: () => {
        setActiveMessage(null)
      },
    })
  }

  const emojiFull = () => {
    setActiveMessage(message.id)
    showPopover({
      body: (
        <Box sx={{ width: "298px" }}>
          <EmojiPicker onSelect={emojiSelected} />
        </Box>
      ),
      toRight: true,
      toBottom: true,
      anchorEl: emojiButton.current!,
      onClose: () => {
        setActiveMessage(null)
      },
    })
  }

  const openThread = () => {
    console.log(message)
    setThreadRoot(message)
  }

  const hide = () => {
    raven?.hideChannelMessage(message.id, "")
  }

  const del = () => {
    raven?.deleteEvents([message.id])
  }

  const buttons = [
    <Tooltip title={t("Reaction")}>
      <IconButton size="small" onClick={emoji} ref={emojiButton}>
        <InsertEmoticon height={20} />
      </IconButton>
    </Tooltip>,
  ]

  if (!inThreadView) {
    buttons.push(
      <Tooltip title={t("Reply in thread")}>
        <IconButton size="small" onClick={openThread}>
          <Reply height={18} />
        </IconButton>
      </Tooltip>
    )
  }

  if (keys?.pub !== message.creator && !("decrypted" in message)) {
    // only public messages
    buttons.push(
      <Tooltip title={t("Hide")}>
        <IconButton size="small" onClick={hide}>
          <RemoveRedEye height={20} />
        </IconButton>
      </Tooltip>
    )
  }

  if (keys?.pub === message.creator) {
    buttons.push(
      <Tooltip title={t("Delete")}>
        <IconButton size="small" onClick={del}>
          <Close height={20} />
        </IconButton>
      </Tooltip>
    )
  }

  if (buttons.length === 0) return null

  return (
    <Box
      sx={{
        padding: "4px 6px",
        borderRadius: theme.shape.borderRadius,
        background: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        display: "flex",
      }}
    >
      {buttons.map((b, i) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mr: i === buttons.length - 1 ? null : "6px",
          }}
          key={i}
        >
          {b}
        </Box>
      ))}
    </Box>
  )
}

export default MessageMenu
