import React, { useEffect, useMemo, useRef, useState } from "react"
import { useAtom } from "jotai"
import uniq from "lodash.uniq"
import { darken } from "@mui/material"
import Box from "@mui/material/Box"
import { useTheme } from "@mui/material/styles"
import Tooltip from "@mui/material/Tooltip"
import { nip19 } from "@terra-money/nostr-tools"
import ProfileDialog from "components/channel/message-view/profile"
import useContentRenderer from "utils/hooks/use-render-content"
import Avatar from "components/channel/message-view/profile/avatar"
import {
  activeMessageAtom,
  profilesAtom,
  threadRootAtom,
} from "utils/nostr/atoms"
import { Message } from "types/nostr"
import { truncateMiddle } from "utils/truncate"
import { ChevronRight } from "@mui/icons-material"
import useModal from "utils/hooks/use-modal"
import { useTranslation } from "react-i18next"
import MessageReactions from "./message-reactions"
import {
  formatMessageDateTime,
  formatMessageFromNow,
  formatMessageTime,
} from "utils/nostr"
import MessageMenu from "./message-menu"

const MessageView = (props: {
  message: Message
  compactView: boolean
  dateFormat: "time" | "fromNow"
  inThreadView?: boolean
}) => {
  const { message, compactView, dateFormat, inThreadView } = props
  const theme = useTheme()
  const [profiles] = useAtom(profilesAtom)
  const profile = profiles.find((x) => x.creator === message.creator)
  const [threadRoot, setThreadRoot] = useAtom(threadRootAtom)
  const [activeMessage] = useAtom(activeMessageAtom)
  const { t } = useTranslation()
  const [, showModal] = useModal()
  const renderer = useContentRenderer()
  const holderEl = useRef<HTMLDivElement | null>(null)
  const [menu, setMenu] = useState<boolean>(false)
  const [isVisible, setIsVisible] = useState<boolean>(true)
  const renderedBody = useMemo(() => renderer(message), [message])
  const profileName = useMemo(
    () =>
      truncateMiddle(
        profile?.name || nip19.npubEncode(message.creator),
        22,
        ":"
      ),
    [profile, message]
  )
  const messageTime = useMemo(
    () =>
      dateFormat === "time"
        ? formatMessageTime(message.created)
        : formatMessageFromNow(message.created),
    [message]
  )
  const messageDateTime = useMemo(
    () => formatMessageDateTime(message.created),
    [message]
  )
  const lastReply = useMemo(
    () =>
      message.children && message.children.length > 0
        ? formatMessageFromNow(
            message.children[message.children.length - 1].created
          )
        : null,
    [message]
  )

  const profileClicked = () => {
    showModal({
      body: <ProfileDialog profile={profile} pubkey={message.creator} />,
      maxWidth: "xs",
      hideOnBackdrop: true,
    })
  }

  useEffect(() => {
    if (!holderEl.current) return

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    })
    observer.observe(holderEl.current)

    return () => {
      observer.disconnect()
    }
  }, [isVisible])

  return (
    <Box
      data-visible={isVisible}
      data-id={message.id}
      className="message"
      ref={holderEl}
      sx={{
        display: "flex",
        p: `${!compactView ? "15px" : "3px"} 10px 0 10px`,
        position: "relative",
        background: activeMessage === message.id ? theme.palette.divider : null,
      }}
      onMouseEnter={() => {
        setMenu(true)
      }}
      onMouseLeave={() => {
        setMenu(false)
      }}
    >
      {(menu || activeMessage === message.id) && (
        <Box
          sx={{
            position: "absolute",
            right: "10px",
            top: "-10px",
          }}
        >
          <MessageMenu message={message} inThreadView={inThreadView} />
        </Box>
      )}
      <Box
        sx={{
          display: "flex",
          width: "40px",
          flexGrow: 0,
          flexShrink: 0,
        }}
      >
        {compactView ? null : (
          <Box sx={{ cursor: "pointer" }} onClick={profileClicked}>
            <Avatar src={profile?.picture} seed={message.creator} size={40} />
          </Box>
        )}
      </Box>
      <Box sx={{ flexGrow: 1, ml: "12px" }}>
        {!compactView && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              fontSize: "0.8em",
              lineHeight: "1em",
              mr: "12px",
              mb: "12px",
            }}
          >
            <Box
              onClick={profileClicked}
              sx={{
                fontWeight: "600",
                mr: "5px",
                cursor: "pointer",
              }}
            >
              {profileName}
            </Box>
            <Tooltip title={messageDateTime} placement="right">
              <Box
                sx={{
                  fontSize: "90%",
                  cursor: "default",
                }}
              >
                {messageTime}
              </Box>
            </Tooltip>
          </Box>
        )}
        <Box
          sx={{
            fontSize: "0.9em",
            mt: "4px",
            wordBreak: "break-word",
            lineHeight: "1.4em",
          }}
        >
          {renderedBody}
        </Box>
        {!inThreadView && message.children && message.children.length > 0 && (
          <Box
            sx={{
              p: "6px",
              mb: "4px",
              display: "inline-flex",
              alignItems: "center",
              fontSize: "0.8rem",
              cursor: "pointer",
              border: "1px solid transparent",
              borderRadius: theme.shape.borderRadius,
              svg: {
                display: "none",
              },
              ":hover": {
                borderColor: theme.palette.divider,
                background: theme.palette.background.paper,
                svg: {
                  display: "block",
                },
              },
            }}
            onClick={() => {
              setThreadRoot(message)
            }}
          >
            {uniq(message.children.map((m) => m.creator))
              .slice(0, 4)
              .map((c) => {
                const profile = profiles.find((x) => x.creator === c)
                return (
                  <Box
                    key={c}
                    sx={{
                      mr: "6px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Avatar src={profile?.picture} seed={c} size={20} />
                  </Box>
                )
              })}
            <Box
              sx={{
                mr: "10px",
                color: theme.palette.primary.main,
                fontWeight: "bold",
              }}
            >
              {message.children.length === 1
                ? t("1 reply")
                : t("{{n}} replies", { n: message.children.length })}
            </Box>
            {!threadRoot && (
              <>
                <Box sx={{ mr: "10px" }}>
                  {t("Last reply {{n}}", { n: lastReply! })}
                </Box>
                <ChevronRight height={20} />
              </>
            )}
          </Box>
        )}
        <MessageReactions message={message} />
      </Box>
    </Box>
  )
}

export default MessageView
