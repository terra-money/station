import { RelayDict } from "types/nostr"
import moment from "moment"

export const DEFAULT_RELAYS: RelayDict = {
  "ws://localhost:7447": { read: true, write: true },
  "wss://relay1.nostrchat.io": { read: true, write: true },
  "wss://relay2.nostrchat.io": { read: true, write: true },
  "wss://relay.damus.io": { read: true, write: true },
  "wss://relay.snort.social": { read: true, write: false },
  "wss://nos.lol": { read: true, write: true },
}

export const SCROLL_DETECT_THRESHOLD = 5
export const MESSAGE_PER_PAGE = 30
export const ACCEPTABLE_LESS_PAGE_MESSAGES = 5
export const TERRA_CID =
  "61e9000f661983b2ccc5b6665acd4aa7a42b5580985562312c6caae5d15811f3"

export function notEmpty<TValue>(
  value: TValue | null | undefined
): value is TValue {
  return value !== null && value !== undefined
}

export const isSha256 = (s: string) => /^[a-f0-9]{64}$/gi.test(s)

export const formatMessageTime = (unixTs: number) =>
  moment.unix(unixTs).format("h:mm a")

export const formatMessageFromNow = (unixTs: number) =>
  moment.unix(unixTs).fromNow()

export const formatMessageDate = (unixTs: number) =>
  moment.unix(unixTs).format("dddd, MMMM Do")

export const formatMessageDateTime = (unixTs: number) =>
  moment.unix(unixTs).format("dddd, MMMM Do h:mm a")
