import { Breakpoint } from "@mui/material"
import { atom } from "jotai"
import {
  Channel,
  ChannelUpdate,
  EventDeletion,
  Profile,
  PublicMessage,
  DirectMessage,
  ChannelMessageHide,
  ChannelUserMute,
  MuteList,
  Message,
  Reaction,
  DirectContact,
  ReadMarkMap,
  Keys,
} from "types/nostr"
import Raven from "utils/nostr/raven"

export const keysAtom = atom<Keys | undefined>(undefined)
export const tempPrivAtom = atom<string>("")
export const ravenAtom = atom<Raven | undefined>(undefined)
export const ravenReadyAtom = atom<boolean>(false)
export const profilesAtom = atom<Profile[]>([])
export const profileAtom = atom<Profile | null>(null)
export const channelsAtom = atom<Channel[]>([])
export const channelAtom = atom<Channel | null>(null)
export const channelToJoinAtom = atom<Channel | null>(null)
export const channelUpdatesAtom = atom<ChannelUpdate[]>([])
export const eventDeletionsAtom = atom<EventDeletion[]>([])
export const publicMessagesAtom = atom<PublicMessage[]>([])
export const directMessagesAtom = atom<DirectMessage[]>([])
export const directContactsAtom = atom<DirectContact[] | []>([])
export const directMessageAtom = atom<string | null>(null)
export const profileToDmAtom = atom<Profile | null>(null)
export const channelMessageHidesAtom = atom<ChannelMessageHide[]>([])
export const channelUserMutesAtom = atom<ChannelUserMute[]>([])
export const muteListAtom = atom<MuteList>({ pubkeys: [], encrypted: "" })
export const leftChannelListAtom = atom<string[]>([])
export const threadRootAtom = atom<Message | null>(null)
export const reactionsAtom = atom<Reaction[]>([])
export const backupWarnAtom = atom<boolean>(false)
export const activeMessageAtom = atom<string | null>(null)
export const readMarkMapAtom = atom<ReadMarkMap>({})
export const showRequestsAtom = atom<boolean>(false)

export type Modal = {
  body: JSX.Element
  fullScreen?: boolean
  maxWidth?: Breakpoint
  hideOnBackdrop?: boolean
  onHide?: () => void
} | null
export const modalAtom = atom<Modal>(null)
