import { useMemo } from "react"
import { useAtom } from "jotai"
import {
  eventDeletionsAtom,
  publicMessagesAtom,
  channelMessageHidesAtom,
  channelUserMutesAtom,
  muteListAtom,
  keysAtom,
} from "utils/nostr/atoms"
import useLiveReactions from "utils/hooks/use-live-reactions"
import { TERRA_CID } from "utils/nostr"

const useLivePublicMessages = () => {
  const [messages] = useAtom(publicMessagesAtom)
  const [eventDeletions] = useAtom(eventDeletionsAtom)
  const [channelMessageHides] = useAtom(channelMessageHidesAtom)
  const [_channelUserMutes] = useAtom(channelUserMutesAtom)
  const [muteList] = useAtom(muteListAtom)
  const [keys] = useAtom(keysAtom)
  const reactions = useLiveReactions()

  // accidentally muted myself -_-
  const channelUserMutes = useMemo(
    () => _channelUserMutes.filter((x) => x.pubkey !== keys?.pub),
    [_channelUserMutes, keys]
  )

  const clean = useMemo(
    () =>
      messages
        .filter(
          (c) => eventDeletions.find((x) => x.eventId === c.id) === undefined
        )
        .filter(
          (c) => channelMessageHides.find((x) => x.id === c.id) === undefined
        )
        .filter(
          (c) =>
            channelUserMutes.find((x) => x.pubkey === c.creator) === undefined
        )
        .filter(
          (c) => muteList.pubkeys.find((x) => x === c.creator) === undefined
        )
        .map((c) => ({
          ...c,
          reactions: reactions.filter((r: any) => r.message === c.id),
        }))
        .sort((a, b) => a.created - b.created),
    [
      messages,
      eventDeletions,
      channelMessageHides,
      channelUserMutes,
      muteList,
      reactions,
    ]
  )

  return useMemo(
    () =>
      clean
        .filter((c) => c.root === TERRA_CID)
        .map((c) => ({ ...c, children: clean.filter((x) => x.root === c.id) })),
    [clean, TERRA_CID]
  )
}

export default useLivePublicMessages
