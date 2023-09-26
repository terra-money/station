import { useEffect, useMemo, useState } from "react"
import isEqual from "lodash.isequal"
import Box from "@mui/material/Box"
import CircularProgress from "@mui/material/CircularProgress"
import ChatInput from "./chat-input"
import ChatView from "./chat-view"
import ThreadChatView from "./thread-chat-view"
import useLivePublicMessages from "utils/hooks/use-live-public-messages"
import {
  ACCEPTABLE_LESS_PAGE_MESSAGES,
  MESSAGE_PER_PAGE,
  TERRA_CID,
} from "utils/nostr"
import { useTranslation } from "react-i18next"
import { Channel, Message } from "types/nostr"
import { initRaven } from "utils/nostr/raven"
import { ravenReadyAtom } from "utils/nostr/atoms"
import { useAtom } from "jotai"
import useLiveChannel from "utils/hooks/use-live-channel"

const ChannelPage = () => {
  const raven = useMemo(() => initRaven(), [])
  const { t } = useTranslation()
  const messages = useLivePublicMessages()
  const [threadRoot, setThreadRoot] = useState<Message | null>(null)
  const [ravenReady] = useAtom(ravenReadyAtom)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const channel = useLiveChannel() as Channel

  useEffect(() => {
    const fetchPrev = () => {
      if (!hasMore || loading) return

      setLoading(true)
      raven
        ?.fetchPrevMessages(messages[0].created)
        .then((num) => {
          if (num < MESSAGE_PER_PAGE - ACCEPTABLE_LESS_PAGE_MESSAGES) {
            setHasMore(false)
          }
          setLoading(false)
        })
        .finally(() => setLoading(false))
    }
    window.addEventListener("chat-view-top", fetchPrev)

    return () => {
      window.removeEventListener("chat-view-top", fetchPrev)
    }
  }, [messages, hasMore, loading])

  useEffect(() => {
    const msg = messages.find((x) => x.id === threadRoot?.id)
    if (threadRoot && msg && !isEqual(msg, threadRoot)) {
      setThreadRoot(msg)
    }
  }, [messages, threadRoot])

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => console.log("Not Found"), 5000)

      window.raven?.fetchChannel(TERRA_CID).then((channel) => {
        if (channel) {
          clearTimeout(timer)
          setLoading(false)
        }
      })

      return () => clearTimeout(timer)
    }
  }, [loading])

  if (!ravenReady) {
    return (
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <CircularProgress size={20} sx={{ mr: "8px" }} /> {t("Loading...")}
      </Box>
    )
  }

  return (
    <>
      <ChatView messages={messages} loading={loading} />
      <ChatInput
        senderFn={(message: string, mentions: string[]) => {
          return raven!
            .sendPublicMessage(channel, message, mentions)
            .catch((e: any) => {
              console.error(e)
            })
        }}
      />
      {threadRoot && (
        <ThreadChatView
          senderFn={(message: string, mentions: string[]) => {
            return raven!
              .sendPublicMessage(
                channel,
                message,
                [threadRoot.creator, ...mentions],
                threadRoot.id
              )
              .catch((e: any) => {
                console.error(e)
              })
          }}
        />
      )}
    </>
  )
}

export default ChannelPage
