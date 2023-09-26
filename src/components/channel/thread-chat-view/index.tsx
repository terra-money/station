import { useRef } from "react"
import { useAtom } from "jotai"
import Divider from "@mui/material/Divider"
import { darken, lighten } from "@mui/material"
import Box from "@mui/material/Box"
import { useTheme } from "@mui/material/styles"
import IconButton from "@mui/material/IconButton"

import MessageView from "components/channel/message-view"
import ChatInput from "components/channel/chat-input"
import { threadRootAtom } from "utils/nostr/atoms"
import { useTranslation } from "react-i18next"
import { Close } from "@mui/icons-material"

import styles from "./ThreadChatView.module.scss"

const ThreadChatView = (props: {
  senderFn: (message: string, mentions: string[]) => Promise<any>
}) => {
  const theme = useTheme()
  const { t } = useTranslation()
  const [threadRoot, setThreadRoot] = useAtom(threadRootAtom)
  const ref = useRef<HTMLDivElement | null>(null)

  if (!threadRoot) return null

  const scrollToBottom = () => {
    ref.current!.scroll({ top: ref.current!.scrollHeight, behavior: "auto" })
  }

  return (
    <Box
      className={styles.ThreadChatView}
      sx={{
        height: "100%",
        flexGrow: 0,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          flexGrow: 0,
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            borderBottom: `1px solid ${theme.palette.divider}`,
            alignItems: "center",
            p: "0 20px",
          }}
        >
          <Box sx={{ fontFamily: "Faktum, sans-serif" }}>{t("Thread")}</Box>
          <IconButton
            onClick={() => {
              setThreadRoot(null)
            }}
          >
            <Close height={20} />
          </IconButton>
        </Box>
        <MessageView
          message={threadRoot}
          dateFormat="fromNow"
          compactView={false}
          inThreadView
        />
        {threadRoot.children && threadRoot.children.length > 0 && (
          <Divider
            textAlign="left"
            sx={{
              fontSize: "0.7em",
              color: darken(theme.palette.text.secondary, 0.4),
              m: "6px 0",
            }}
          >
            {t("{{n}} replies", { n: threadRoot.children.length })}
          </Divider>
        )}
      </Box>
      <Box
        ref={ref}
        sx={{
          flexGrow: 1,
        }}
      >
        {threadRoot.children?.map((msg) => {
          return (
            <MessageView
              key={msg.id}
              message={msg}
              dateFormat="fromNow"
              compactView={false}
              inThreadView
            />
          )
        })}
      </Box>
      <ChatInput
        senderFn={(message: string, mentions: string[]) => {
          return props.senderFn(message, mentions).then(() => {
            setTimeout(() => {
              scrollToBottom()
            }, 500)
          })
        }}
      />
    </Box>
  )
}

export default ThreadChatView
