import { useRef } from "react"
import Box from "@mui/material/Box"
import Tooltip from "@mui/material/Tooltip"
import { useAtom } from "jotai"
import { Message } from "types/nostr"
import { Chat, Close, InsertEmoticon, RemoveRedEye } from "@mui/icons-material"
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
import styles from "./MessageMenu.module.scss"
import { Button } from "components/general"
import { Card } from "components/layout"

const MessageMenu = (props: { message: Message; inThreadView?: boolean }) => {
  const { message, inThreadView } = props
  const [keys] = useAtom(keysAtom)
  const [raven] = useAtom(ravenAtom)
  const [, setActiveMessage] = useAtom(activeMessageAtom)
  const [, setThreadRoot] = useAtom(threadRootAtom)
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
        <Card className={styles.ShortEmojiPickerWrapper}>
          <ShortEmojiPicker onSelect={emojiSelected} onMore={emojiFull} />
        </Card>
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
        <Card className={styles.ShortEmojiPickerWrapper}>
          <EmojiPicker onSelect={emojiSelected} />
        </Card>
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
      <Button size="small" onClick={emoji} ref={emojiButton}>
        <InsertEmoticon height={20} />
      </Button>
    </Tooltip>,
  ]

  if (!inThreadView) {
    buttons.push(
      <Tooltip title={t("Reply in thread")}>
        <Button size="small" onClick={openThread}>
          <Chat height={18} />
        </Button>
      </Tooltip>
    )
  }

  if (keys?.pub !== message.creator && !("decrypted" in message)) {
    // only public messages
    buttons.push(
      <Tooltip title={t("Hide")}>
        <Button size="small" onClick={hide}>
          <RemoveRedEye height={20} />
        </Button>
      </Tooltip>
    )
  }

  if (keys?.pub === message.creator) {
    buttons.push(
      <Tooltip title={t("Delete")}>
        <Button size="small" onClick={del}>
          <Close height={20} />
        </Button>
      </Tooltip>
    )
  }

  if (buttons.length === 0) return null

  return (
    <Box className={styles.MessageMenu}>
      {buttons.map((b, i) => (
        <Box key={i}>{b}</Box>
      ))}
    </Box>
  )
}

export default MessageMenu
