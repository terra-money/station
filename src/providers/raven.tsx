import React, { useEffect, useMemo, useState } from "react"
import uniq from "lodash.uniq"
import { nip04, nip19 } from "@terra-money/nostr-tools"

import { initRaven, RavenEvents } from "utils/nostr/raven"
import {
  Channel,
  ChannelUpdate,
  DirectMessage,
  EventDeletion,
  Profile,
  PublicMessage,
  ChannelMessageHide,
  ChannelUserMute,
  MuteList,
  Reaction,
  ReadMarkMap,
} from "types/nostr"

import {
  keysAtom,
  tempPrivAtom,
  ravenAtom,
  ravenReadyAtom,
  profileAtom,
  profilesAtom,
  channelUpdatesAtom,
  eventDeletionsAtom,
  publicMessagesAtom,
  directMessagesAtom,
  directMessageAtom,
  channelMessageHidesAtom,
  channelUserMutesAtom,
  muteListAtom,
  leftChannelListAtom,
  readMarkMapAtom,
  reactionsAtom,
  directContactsAtom,
  channelsAtom,
} from "utils/nostr/atoms"
import { useAtom } from "jotai"

const RavenProvider = (props: { children: React.ReactNode }) => {
  const [keys] = useAtom(keysAtom)
  const [tempPriv] = useAtom(tempPrivAtom)
  const [, setRaven] = useAtom(ravenAtom)
  const [ravenReady, setRavenReady] = useAtom(ravenReadyAtom)
  const [profile, setProfile] = useAtom(profileAtom)
  const [profiles, setProfiles] = useAtom(profilesAtom)
  const [channels, setChannels] = useAtom(channelsAtom)
  const [channelUpdates, setChannelUpdates] = useAtom(channelUpdatesAtom)
  const [eventDeletions, setEventDeletions] = useAtom(eventDeletionsAtom)
  const [publicMessages, setPublicMessages] = useAtom(publicMessagesAtom)
  const [directMessages, setDirectMessages] = useAtom(directMessagesAtom)
  const [directMessage] = useAtom(directMessageAtom)
  const [channelMessageHides, setChannelMessageHides] = useAtom(
    channelMessageHidesAtom
  )
  const [channelUserMutes, setChannelUserMutes] = useAtom(channelUserMutesAtom)
  const [muteList, setMuteList] = useAtom(muteListAtom)
  const [leftChannelList, setLeftChannelList] = useAtom(leftChannelListAtom)
  const [readMarkMap, setReadMarkMap] = useAtom(readMarkMapAtom)
  const [reactions, setReactions] = useAtom(reactionsAtom)
  const [, setDirectContacts] = useAtom(directContactsAtom)
  const [since, setSince] = useState<number>(0)

  const raven = useMemo(() => initRaven(keys), [keys])

  // Listen for events in an interval.
  useEffect(() => {
    if (!ravenReady) return

    const timer = setTimeout(
      () => {
        raven?.listen(
          channels.map((x) => x.id),
          Math.floor((since || Date.now()) / 1000)
        )
        setSince(Date.now())
      },
      since === 0 ? 500 : 10000
    )

    return () => {
      clearTimeout(timer)
    }
  }, [since, ravenReady, raven, channels])

  // Trigger listen once the window visibility changes.
  const visibilityChange = () => {
    if (document.visibilityState === "visible") {
      raven?.listen(
        channels.map((x) => x.id),
        Math.floor((since || Date.now()) / 1000)
      )
      setSince(Date.now())
    }
  }
  useEffect(() => {
    document.addEventListener("visibilitychange", visibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", visibilityChange)
    }
  }, [since, ravenReady, raven, channels])

  useEffect(() => {
    setDirectContacts(
      [...new Set(directMessages.map((x) => x.peer))].map((p) => ({
        pub: p,
        npub: nip19.npubEncode(p),
      }))
    )
  }, [directMessages])

  // Ready state handler
  const handleReadyState = () => {
    setRavenReady(true)
  }

  useEffect(() => {
    raven?.removeListener(RavenEvents.Ready, handleReadyState)
    raven?.addListener(RavenEvents.Ready, handleReadyState)
    return () => {
      raven?.removeListener(RavenEvents.Ready, handleReadyState)
    }
  }, [ravenReady, raven])

  // Profile update handler
  const handleProfileUpdate = (data: Profile[]) => {
    setProfiles([
      ...profiles.filter(
        (x) => data.find((y) => x.creator === y.creator) === undefined
      ),
      ...data,
    ])

    const profile = data.find((x) => x.creator === keys!.pub)
    if (profile) {
      setProfile(profile)
    }
  }

  useEffect(() => {
    raven?.removeListener(RavenEvents.ProfileUpdate, handleProfileUpdate)
    raven?.addListener(RavenEvents.ProfileUpdate, handleProfileUpdate)
    return () => {
      raven?.removeListener(RavenEvents.ProfileUpdate, handleProfileUpdate)
    }
  }, [raven, profile, profiles])

  // Channel creation handler
  const handleChannelCreation = (data: Channel[]) => {
    const append = data.filter(
      (x) => channels.find((y) => y.id === x.id) === undefined
    )
    setChannels([...channels, ...append])
  }

  useEffect(() => {
    raven?.removeListener(RavenEvents.ChannelCreation, handleChannelCreation)
    raven?.addListener(RavenEvents.ChannelCreation, handleChannelCreation)

    return () => {
      raven?.removeListener(RavenEvents.ChannelCreation, handleChannelCreation)
    }
  }, [raven, channels])

  // Channel update handler
  const handleChannelUpdate = (data: ChannelUpdate[]) => {
    const append = data.filter(
      (x) => channelUpdates.find((y) => y.id === x.id) === undefined
    )
    setChannelUpdates([...channelUpdates, ...append])
  }

  useEffect(() => {
    raven?.removeListener(RavenEvents.ChannelUpdate, handleChannelUpdate)
    raven?.addListener(RavenEvents.ChannelUpdate, handleChannelUpdate)

    return () => {
      raven?.removeListener(RavenEvents.ChannelUpdate, handleChannelUpdate)
    }
  }, [raven, channelUpdates])

  // Event deletion handler
  const handleEventDeletion = (data: EventDeletion[]) => {
    const append = data.filter(
      (x) => eventDeletions.find((y) => y.eventId === x.eventId) === undefined
    )
    setEventDeletions([...eventDeletions, ...append])
  }

  useEffect(() => {
    raven?.removeListener(RavenEvents.EventDeletion, handleEventDeletion)
    raven?.addListener(RavenEvents.EventDeletion, handleEventDeletion)

    return () => {
      raven?.removeListener(RavenEvents.EventDeletion, handleEventDeletion)
    }
  }, [raven, eventDeletions])

  // Public message handler
  const handlePublicMessage = (data: PublicMessage[]) => {
    const append = data.filter(
      (x) => publicMessages.find((y) => y.id === x.id) === undefined
    )
    raven?.loadProfiles(append.map((x) => x.creator))
    setPublicMessages([...publicMessages, ...append])
  }

  useEffect(() => {
    raven?.removeListener(RavenEvents.PublicMessage, handlePublicMessage)
    raven?.addListener(RavenEvents.PublicMessage, handlePublicMessage)

    return () => {
      raven?.removeListener(RavenEvents.PublicMessage, handlePublicMessage)
    }
  }, [raven, publicMessages])

  // Direct message handler
  const handleDirectMessage = (data: DirectMessage[]) => {
    const append = data.filter(
      (x) => directMessages.find((y) => y.id === x.id) === undefined
    )
    raven?.loadProfiles(append.map((x) => x.peer))
    setDirectMessages([...directMessages, ...append])
  }

  useEffect(() => {
    raven?.removeListener(RavenEvents.DirectMessage, handleDirectMessage)
    raven?.addListener(RavenEvents.DirectMessage, handleDirectMessage)

    return () => {
      raven?.removeListener(RavenEvents.DirectMessage, handleDirectMessage)
    }
  }, [raven, directMessages])

  // Channel message hide handler
  const handlePublicMessageHide = (data: ChannelMessageHide[]) => {
    const append = data.filter(
      (x) => channelMessageHides.find((y) => y.id === x.id) === undefined
    )
    setChannelMessageHides([...channelMessageHides, ...append])
  }

  useEffect(() => {
    raven?.removeListener(
      RavenEvents.ChannelMessageHide,
      handlePublicMessageHide
    )
    raven?.addListener(RavenEvents.ChannelMessageHide, handlePublicMessageHide)

    return () => {
      raven?.removeListener(
        RavenEvents.ChannelMessageHide,
        handlePublicMessageHide
      )
    }
  }, [raven, channelMessageHides])

  // Channel user mute handler
  const handleChannelUserMute = (data: ChannelUserMute[]) => {
    const append = data.filter(
      (x) => channelUserMutes.find((y) => y.pubkey === x.pubkey) === undefined
    )
    setChannelUserMutes([...channelUserMutes, ...append])
  }

  useEffect(() => {
    raven?.removeListener(RavenEvents.ChannelUserMute, handleChannelUserMute)
    raven?.addListener(RavenEvents.ChannelUserMute, handleChannelUserMute)

    return () => {
      raven?.removeListener(RavenEvents.ChannelUserMute, handleChannelUserMute)
    }
  }, [raven, channelUserMutes])

  // Mute list handler
  const handleMuteList = (data: MuteList) => {
    setMuteList(data)
  }

  useEffect(() => {
    raven?.removeListener(RavenEvents.MuteList, handleMuteList)
    raven?.addListener(RavenEvents.MuteList, handleMuteList)

    return () => {
      raven?.removeListener(RavenEvents.MuteList, handleMuteList)
    }
  }, [raven, muteList])

  // Left channel handler

  const handleLeftChannelList = (data: string[]) => {
    setLeftChannelList(data)
  }

  useEffect(() => {
    raven?.removeListener(RavenEvents.LeftChannelList, handleLeftChannelList)
    raven?.addListener(RavenEvents.LeftChannelList, handleLeftChannelList)

    return () => {
      raven?.removeListener(RavenEvents.LeftChannelList, handleLeftChannelList)
    }
  }, [raven, leftChannelList])

  const handleReadMarkMap = (data: ReadMarkMap) => {
    setReadMarkMap(data)
  }

  useEffect(() => {
    raven?.removeListener(RavenEvents.ReadMarkMap, handleReadMarkMap)
    raven?.addListener(RavenEvents.ReadMarkMap, handleReadMarkMap)

    return () => {
      raven?.removeListener(RavenEvents.ReadMarkMap, handleReadMarkMap)
    }
  }, [raven, readMarkMap])

  // muteList runtime decryption for nip04 wallet users.
  useEffect(() => {
    if (
      (keys?.priv === "nip07" || keys?.priv === "none") &&
      muteList.encrypted
    ) {
      let promise
      if (keys.priv === "none" && tempPriv) {
        promise = nip04.decrypt(tempPriv, keys.pub, muteList.encrypted)
      } else if (keys.priv === "nip07") {
        promise = window.nostr?.nip04.decrypt(keys.pub, muteList.encrypted)
      }

      promise
        ?.then((e) => JSON.parse(e))
        .then((resp) => {
          setMuteList({
            pubkeys: uniq(resp.map((x: any) => x?.[1])),
            encrypted: "",
          })
        })
    }
  }, [muteList, keys, tempPriv])

  // reaction handler
  const handleReaction = (data: Reaction[]) => {
    const append = data.filter(
      (x) => reactions.find((y) => y.id === x.id) === undefined
    )
    raven?.loadProfiles(append.map((x) => x.creator))
    setReactions([...reactions, ...append])
  }

  useEffect(() => {
    raven?.removeListener(RavenEvents.Reaction, handleReaction)
    raven?.addListener(RavenEvents.Reaction, handleReaction)

    return () => {
      raven?.removeListener(RavenEvents.Reaction, handleReaction)
    }
  }, [raven, reactions])

  // decrypt direct messages one by one to avoid show nip7 wallet dialog many times.
  useEffect(() => {
    if ((keys?.priv === "nip07" || keys?.priv === "none") && directMessage) {
      const toDecrypt = directMessages
        .filter((m) => m.peer === directMessage)
        .find((x) => !x.decrypted)
      if (toDecrypt) {
        let promise
        if (keys.priv === "none" && tempPriv) {
          promise = nip04.decrypt(tempPriv, toDecrypt.peer, toDecrypt.content)
        } else if (keys.priv === "nip07") {
          promise = window.nostr?.nip04.decrypt(
            toDecrypt.peer,
            toDecrypt.content
          )
        }

        promise?.then((content) => {
          setDirectMessages(
            directMessages.map((m) => {
              if (m.id === toDecrypt.id) {
                return {
                  ...m,
                  content,
                  decrypted: true,
                }
              }
              return m
            })
          )
        })
      }
    }
  }, [directMessages, directMessage, tempPriv, keys])

  // Init raven
  useEffect(() => {
    setRaven(raven)

    return () => {
      raven?.removeListener(RavenEvents.Ready, handleReadyState)
      raven?.removeListener(RavenEvents.ProfileUpdate, handleProfileUpdate)
      raven?.removeListener(RavenEvents.ChannelCreation, handleChannelCreation)
      raven?.removeListener(RavenEvents.ChannelUpdate, handleChannelUpdate)
      raven?.removeListener(RavenEvents.EventDeletion, handleEventDeletion)
      raven?.removeListener(RavenEvents.PublicMessage, handlePublicMessage)
      raven?.removeListener(RavenEvents.DirectMessage, handleDirectMessage)
      raven?.removeListener(
        RavenEvents.ChannelMessageHide,
        handlePublicMessageHide
      )
      raven?.removeListener(RavenEvents.ChannelUserMute, handleChannelUserMute)
      raven?.removeListener(RavenEvents.MuteList, handleMuteList)
      raven?.removeListener(RavenEvents.LeftChannelList, handleLeftChannelList)
      raven?.removeListener(RavenEvents.ReadMarkMap, handleReadMarkMap)
      raven?.removeListener(RavenEvents.Reaction, handleReaction)
    }
  }, [raven])

  return <>{props.children}</>
}

export default RavenProvider