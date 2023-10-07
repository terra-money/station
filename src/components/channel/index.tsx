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
import { channelAtom, ravenReadyAtom, threadRootAtom } from "utils/nostr/atoms"
import { useAtom } from "jotai"
import useLiveChannel from "utils/hooks/use-live-channel"
import useLiveChannels from "utils/hooks/use-live-channels"
import { Card } from "components/layout"
import styles from "./Channel.module.scss"

const ChannelPage = () => {
  const { t } = useTranslation()
  const messages = useLivePublicMessages(TERRA_CID)
  const [, setChannel] = useAtom(channelAtom)
  const [threadRoot, setThreadRoot] = useAtom(threadRootAtom)
  const [ravenReady] = useAtom(ravenReadyAtom)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const channels = useLiveChannels()
  const channel = useLiveChannel()

  useEffect(() => {
    const fetchPrev = () => {
      if (!hasMore || loading) return

      setLoading(true)
      window.raven
        ?.fetchPrevMessages(channel!.id, messages[0].created)
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
    setChannel(channels.find((x) => x.id === TERRA_CID) || null)
  }, [channels])

  useEffect(() => {
    const msg = messages.find((x) => x.id === threadRoot?.id)
    if (threadRoot && msg && !isEqual(msg, threadRoot)) {
      setThreadRoot(msg)
    }
  }, [messages, threadRoot])

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => console.log("Not Found"), 5000)

      if (!channel?.id) {
        setLoading(true)
        return
      }

      window.raven?.fetchChannel(channel.id).then((channel) => {
        if (channel) {
          clearTimeout(timer)
          setLoading(false)
        }
      })

      return () => clearTimeout(timer)
    }
  }, [loading, channel])

  if (!ravenReady || !channel) {
    return (
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <CircularProgress size={20} sx={{ mr: "8px" }} /> {t("Loading...")}
      </Box>
    )
  }

  return (
    <Card>
      <div className={styles.ChannelView}>
        <div>
          <ChatView messages={messages} loading={loading} />
          <ChatInput
            senderFn={(message: string, mentions: string[]) => {
              return window
                .raven!.sendPublicMessage(channel, message, mentions)
                .catch((e: any) => {
                  console.error(e)
                })
            }}
          />
        </div>
        {threadRoot && (
          <ThreadChatView
            senderFn={(message: string, mentions: string[]) => {
              return window
                .raven!.sendPublicMessage(
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
      </div>
    </Card>
  )
}

export default ChannelPage
