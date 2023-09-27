import {
  Event,
  Filter,
  getEventHash,
  Kind,
  nip04,
  signEvent,
  SimplePool,
  Sub,
} from "@terra-money/nostr-tools"
import {
  PrivKey,
  Channel,
  ChannelMessageHide,
  ChannelUpdate,
  ChannelUserMute,
  DirectMessage,
  EventDeletion,
  Keys,
  Metadata,
  MuteList,
  PublicMessage,
  Reaction,
  ReadMarkMap,
  Profile,
} from "types/nostr"
import chunk from "lodash.chunk"
import uniq from "lodash.uniq"
import { DEFAULT_RELAYS, MESSAGE_PER_PAGE, TERRA_CID } from "utils/nostr"
import { notEmpty, isSha256 } from "."
import { TypedEventEmitter } from "providers/event-emitter"
import { storeKeys } from "utils/localStorage/nostr"

enum NewKinds {
  MuteList = 10000,
  Arbitrary = 30078,
}

export enum RavenEvents {
  Ready = "ready",
  SyncDone = "sync_done",
  ProfileUpdate = "profile_update",
  ChannelCreation = "channel_creation",
  ChannelUpdate = "channel_update",
  EventDeletion = "event_deletion",
  PublicMessage = "public_message",
  DirectMessage = "direct_message",
  ChannelMessageHide = "channel_message_hide",
  ChannelUserMute = "channel_user_mute",
  MuteList = "mute_list",
  LeftChannelList = "left_channel_list",
  Reaction = "reaction",
  ReadMarkMap = "read_mark_map",
}

type EventHandlerMap = {
  [RavenEvents.Ready]: () => void
  [RavenEvents.SyncDone]: () => void
  [RavenEvents.ProfileUpdate]: (data: Profile[]) => void
  [RavenEvents.ChannelCreation]: (data: Channel[]) => void
  [RavenEvents.ChannelUpdate]: (data: ChannelUpdate[]) => void
  [RavenEvents.EventDeletion]: (data: EventDeletion[]) => void
  [RavenEvents.PublicMessage]: (data: PublicMessage[]) => void
  [RavenEvents.DirectMessage]: (data: DirectMessage[]) => void
  [RavenEvents.ChannelMessageHide]: (data: ChannelMessageHide[]) => void
  [RavenEvents.ChannelUserMute]: (data: ChannelUserMute[]) => void
  [RavenEvents.MuteList]: (data: MuteList) => void
  [RavenEvents.LeftChannelList]: (data: string[]) => void
  [RavenEvents.Reaction]: (data: Reaction[]) => void
  [RavenEvents.ReadMarkMap]: (data: ReadMarkMap) => void
}

class Raven extends TypedEventEmitter<RavenEvents, EventHandlerMap> {
  priv: PrivKey
  pub: string

  readRelays = Object.keys(DEFAULT_RELAYS).filter((r) => DEFAULT_RELAYS[r].read)
  writeRelays = Object.keys(DEFAULT_RELAYS).filter(
    (r) => DEFAULT_RELAYS[r].write
  )

  eventQueue: Event[] = []
  eventQueueTimer: any
  eventQueueFlag = true
  eventQueueBuffer: Event[] = []

  nameCache: Record<string, number> = {}

  listenerSub: string | null = null
  messageListenerSub: string | null = null

  seenOn: Record<string, string[]> = {}
  subs: Record<string, Sub> = {}
  relays: string[] = []
  pool = new SimplePool()
  poolCreated = Date.now()

  constructor(priv: string, pub: string) {
    super()
    this.priv = priv
    this.pub = pub
    this.relays = this.readRelays

    if (priv && pub) {
      storeKeys({ priv, pub })
      this.init().then()
    }
  }

  private async init() {
    // 1- Get all event created by the user
    const events = await this.fetch([
      {
        authors: [this.pub],
      },
    ])
    events.forEach((e) => this.pushToEventBuffer(e))
    this.emit(RavenEvents.Ready)

    // 2- Get channels messages
    // Build channel ids
    const deletions = events
      .filter((x) => x.kind === Kind.EventDeletion)
      .map((x) => Raven.findTagValue(x, "e"))
      .filter(notEmpty)

    const channelIds = uniq(
      events
        .map((x) => {
          if (x.kind === Kind.ChannelCreation) {
            return x.id
          }

          if (x.kind === Kind.ChannelMessage) {
            return Raven.findTagValue(x, "e")
          }

          return null
        })
        .filter(notEmpty)
        .filter((x) => !deletions.includes(x))
        .filter(notEmpty)
    )

    if (!channelIds.includes(TERRA_CID)) {
      channelIds.push(TERRA_CID)
    }

    // Get real channel list over the channel list collected from channel creations + public messages sent.
    const channels = await this.fetch([
      ...chunk(channelIds, 10).map((x) => ({
        kinds: [Kind.ChannelCreation],
        ids: x,
      })),
    ])
    channels.forEach((x) => this.pushToEventBuffer(x))

    // Get messages for all channels found
    const promises = chunk(
      [
        ...chunk(
          channels.map((x) => x.id),
          20
        )
          .map((x) => [
            {
              kinds: [Kind.ChannelMetadata, Kind.EventDeletion],
              "#e": x,
            },
            {
              kinds: [Kind.ChannelMessage],
              "#e": x,
              limit: MESSAGE_PER_PAGE,
            },
          ])
          .flat(),
      ],
      10
    ).map((f) =>
      this.fetch(f).then((events) =>
        events.forEach((ev) => this.pushToEventBuffer(ev))
      )
    )
    await Promise.all(promises)
  }

  public isSyntheticPrivKey = () => {
    return this.priv === "nip07" || this.priv === "none"
  }

  public fetchPrevMessages(channelID: string, until: number) {
    return this.fetch(
      [
        {
          kinds: [Kind.ChannelMessage],
          "#e": [channelID],
          until,
          limit: MESSAGE_PER_PAGE,
        },
      ],
      1000
    ).then((events) => {
      events.forEach((ev) => {
        this.pushToEventBuffer(ev)
      })

      return events.length
    })
  }

  public async fetchChannel(id: string): Promise<Channel | null> {
    const filters: Filter[] = [
      {
        kinds: [40],
        ids: [id],
      },
      {
        kinds: [41, 5],
        "#e": [id],
      },
    ]

    const events = await this.fetch(filters)
    if (events.length === 0) return null // Not found

    const creation = events.find((x) => x.kind === Kind.ChannelCreation)
    if (!creation) return null // Not found

    if (
      events.find(
        (x) => x.kind === Kind.EventDeletion && x.pubkey === creation.pubkey
      )
    )
      return null // Deleted

    const update = events
      .filter(
        (x) => x.kind === Kind.ChannelMetadata && x.pubkey === creation.pubkey
      )
      .sort((a, b) => b.created_at - a.created_at)[0] // Find latest metadata update

    const content = Raven.parseJson((update || creation).content)
    if (!content) return null // Invalid content

    return {
      id: creation.id,
      creator: creation.pubkey,
      created: creation.created_at,
      ...Raven.normalizeMetadata(content),
    }
  }

  public async fetchProfile(pub: string): Promise<Profile | null> {
    const filters: Filter[] = [
      {
        kinds: [Kind.Metadata],
        authors: [pub],
      },
    ]

    const ev = (await this.fetch(filters)).sort(
      (a, b) => b.created_at - a.created_at
    )[0]
    if (!ev) return null // Not found

    const content = Raven.parseJson(ev.content)
    if (!content) return null // Invalid content

    return {
      id: ev.id,
      creator: ev.pubkey,
      created: ev.created_at,
      ...Raven.normalizeMetadata(content),
      nip05: content.nip05,
    }
  }

  public fetch(filters: Filter[], quitMs: number = 0): Promise<Event[]> {
    return new Promise((resolve) => {
      const pool = this.getPool()
      const sub = pool.sub(this.relays, filters)
      const events: Event[] = []

      const quit = () => {
        sub.unsub()
        resolve(events)
      }

      let timer: any = quitMs > 0 ? setTimeout(quit, quitMs) : null

      sub.on("event", (event: Event) => {
        events.push(event)
        this.seenOn[event.id] = pool.seenOn(event.id)

        if (quitMs > 0) {
          clearTimeout(timer)
          timer = setTimeout(quit, quitMs)
        }
      })

      if (quitMs === 0) {
        sub.on("eose", () => {
          sub.unsub()
          resolve(events)
        })
      }
    })
  }

  private getPool = (): SimplePool => {
    if (Date.now() - this.poolCreated > 120000) {
      // renew pool every two minutes
      this.pool.close(this.relays)

      this.pool = new SimplePool()
      this.poolCreated = Date.now()
    }

    return this.pool
  }

  private sub(filters: Filter[], unsub: boolean = true) {
    const subId = Math.random().toString().slice(2)
    const pool = this.getPool()
    const sub = pool.sub(this.relays, filters, { id: subId })

    sub.on("event", (event: Event) => {
      this.seenOn[event.id] = pool.seenOn(event.id)
      this.pushToEventBuffer(event)
    })

    sub.on("eose", () => {
      if (unsub) {
        this.unsub(subId)
      }
    })

    this.subs[subId] = sub
    return subId
  }

  private unsub(subId: string) {
    if (this.subs[subId]) {
      this.subs[subId].unsub()
      delete this.subs[subId]
    }
  }

  public loadChannel(id: string) {
    const filters: Filter[] = [
      {
        kinds: [Kind.ChannelCreation],
        ids: [id],
      },
      {
        kinds: [Kind.ChannelMetadata, Kind.EventDeletion],
        "#e": [id],
      },
      {
        kinds: [Kind.ChannelMessage],
        "#e": [id],
        limit: MESSAGE_PER_PAGE,
      },
    ]

    this.sub(filters)
  }

  public loadProfiles(pubs: string[]) {
    const authors = uniq(pubs).filter((p) => this.nameCache[p] === undefined)
    if (authors.length === 0) {
      return
    }
    authors.forEach((a) => (this.nameCache[a] = Date.now()))

    chunk(authors, 20).forEach((a) => {
      this.sub([
        {
          kinds: [Kind.Metadata],
          authors: a,
        },
      ])
    })
  }

  public listen(channels: string[], since: number) {
    if (this.listenerSub) {
      this.unsub(this.listenerSub)
    }

    this.listenerSub = this.sub(
      [
        {
          authors: [this.pub],
          since,
        },
        {
          kinds: [
            Kind.EventDeletion,
            Kind.ChannelMetadata,
            Kind.ChannelMessage,
          ],
          "#e": channels,
          since,
        },
        {
          kinds: [Kind.EncryptedDirectMessage],
          "#p": [this.pub],
          since,
        },
      ],
      false
    )
  }

  public listenMessages = (messageIds: string[], relIds: string[]) => {
    if (this.messageListenerSub) {
      this.unsub(this.messageListenerSub)
    }

    const filters: Filter[] = [
      {
        kinds: [Kind.EventDeletion, Kind.ChannelMessage, Kind.Reaction],
        "#e": messageIds,
      },
      ...chunk(relIds, 10).map((c) => ({
        kinds: [Kind.EventDeletion],
        "#e": c,
      })),
    ]

    this.messageListenerSub = this.sub(filters, false)
  }

  public async updateProfile(profile: Metadata) {
    const filters: Filter[] = [
      {
        kinds: [Kind.Metadata],
        authors: [this.pub],
      },
    ]
    const latestEv = (await this.fetch(filters)).sort(
      (a, b) => b.created_at - a.created_at
    )[0]
    const latest = latestEv?.content ? Raven.parseJson(latestEv?.content) : ""
    const update =
      latest.constructor === Object ? { ...latest, ...profile } : { ...profile }
    return this.publish(Kind.Metadata, [], JSON.stringify(update))
  }

  public async createChannel(meta: Metadata) {
    return this.publish(Kind.ChannelCreation, [], JSON.stringify(meta))
  }

  public async updateChannel(channel: Channel, meta: Metadata) {
    return this.where(channel.id).then((relay) => {
      return this.publish(
        Kind.ChannelMetadata,
        [["e", channel.id, relay]],
        JSON.stringify(meta)
      )
    })
  }

  public async where(eventId: string) {
    let try_ = 0
    while (!this.seenOn[eventId]) {
      await this.fetch([{ ids: [eventId] }])
      try_++
      if (try_ === 3) {
        break
      }
    }

    if (!this.seenOn[eventId]) {
      throw new Error("Could not find root event")
    }

    return this.findHealthyRelay(this.seenOn[eventId])
  }

  private async findHealthyRelay(relays: string[]) {
    const pool = this.getPool()
    for (const relay of relays) {
      try {
        await pool.ensureRelay(relay)
        return relay
      } catch (e) {}
    }

    throw new Error("Couldn't find a working relay")
  }

  public async deleteEvents(ids: string[], why: string = "") {
    return this.publish(
      Kind.EventDeletion,
      [...ids.map((id) => ["e", id])],
      why
    )
  }

  public async sendPublicMessage(
    channel: Channel,
    message: string,
    mentions?: string[],
    parent?: string
  ) {
    const root = parent || channel.id
    const relay = await this.where(root)
    const tags = [["e", root, relay, "root"]]
    if (mentions) {
      mentions.forEach((m) => tags.push(["p", m]))
    }
    return this.publish(Kind.ChannelMessage, tags, message)
  }

  public async sendDirectMessage(
    toPubkey: string,
    message: string,
    mentions?: string[],
    parent?: string
  ) {
    const encrypted = await this.encrypt(toPubkey, message)
    const tags = [["p", toPubkey]]
    if (mentions) {
      mentions.forEach((m) => tags.push(["p", m]))
    }
    if (parent) {
      const relay = await this.where(parent)
      tags.push(["e", parent, relay, "root"])
    }
    return this.publish(Kind.EncryptedDirectMessage, tags, encrypted)
  }

  public async recommendRelay(relay: string) {
    return this.publish(Kind.RecommendRelay, [], relay)
  }

  public async hideChannelMessage(id: string, reason: string) {
    return this.publish(
      Kind.ChannelHideMessage,
      [["e", id]],
      JSON.stringify({ reason })
    )
  }

  public async muteChannelUser(pubkey: string, reason: string) {
    return this.publish(
      Kind.ChannelMuteUser,
      [["p", pubkey]],
      JSON.stringify({ reason })
    )
  }

  public async updateMuteList(userIds: string[]) {
    const list = [...userIds.map((id) => ["p", id])]
    const content = await this.encrypt(this.pub, JSON.stringify(list))
    return this.publish(NewKinds.MuteList, [], content)
  }

  public async sendReaction(message: string, pubkey: string, reaction: string) {
    const relay = await this.where(message)
    const tags = [
      ["e", message, relay, "root"],
      ["p", pubkey],
    ]
    return this.publish(Kind.Reaction, tags, reaction)
  }

  public async updateLeftChannelList(channelIds: string[]) {
    const tags = [["d", "left-channel-list"]]
    return this.publish(NewKinds.Arbitrary, tags, JSON.stringify(channelIds))
  }

  public async updateReadMarkMap(map: ReadMarkMap) {
    const tags = [["d", "read-mark-map"]]
    return this.publish(NewKinds.Arbitrary, tags, JSON.stringify(map))
  }

  private publish(
    kind: number,
    tags: Array<any>[],
    content: string
  ): Promise<Event> {
    return new Promise((resolve, reject) => {
      const pool = new SimplePool()

      this.signEvent({
        kind,
        tags,
        pubkey: this.pub,
        content,
        created_at: Math.floor(Date.now() / 1000),
        id: "",
        sig: "",
      })
        .then((event) => {
          if (!event) {
            reject("Couldn't sign event!")
            return
          }

          this.pushToEventBuffer(event)

          let resolved = false
          const okRelays: string[] = []
          const failedRelays: string[] = []

          const pub = pool.publish(this.writeRelays, event)

          const closePool = () => {
            if (
              [...okRelays, ...failedRelays].length === this.writeRelays.length
            ) {
              pool.close(this.writeRelays)
            }
          }

          pub.on("ok", (r: string) => {
            okRelays.push(r)
            if (!resolved) {
              resolve(event)
              resolved = true
            }
            closePool()
          })

          pub.on("failed", (r: string) => {
            failedRelays.push(r)
            if (failedRelays.length === this.writeRelays.length) {
              reject("Event couldn't be published on any relay!")
            }
            closePool()
          })
        })
        .catch(() => {
          reject("Couldn't publish event!")
        })
        .finally(() => {
          pool.close(this.writeRelays)
        })
    })
  }

  private async encrypt(pubkey: string, content: string) {
    if (this.priv === "nip07") {
      return window.nostr!.nip04.encrypt(pubkey, content)
    } else {
      const priv =
        this.priv === "none"
          ? await window.requestPrivateKey({ pubkey, content })
          : this.priv
      return nip04.encrypt(priv, pubkey, content)
    }
  }

  private async signEvent(event: Event): Promise<Event | undefined> {
    if (this.priv === "nip07") {
      return window.nostr?.signEvent(event)
    } else {
      const priv =
        this.priv === "none" ? await window.requestPrivateKey(event) : this.priv
      return {
        ...event,
        id: getEventHash(event),
        sig: signEvent(event, priv),
      }
    }
  }

  pushToEventBuffer(event: Event) {
    const cacheKey = `${event.id}_emitted`
    if (this.nameCache[cacheKey] === undefined) {
      if (this.eventQueueFlag) {
        if (this.eventQueueBuffer.length > 0) {
          this.eventQueue.push(...this.eventQueueBuffer)
          this.eventQueueBuffer = []
        }
        clearTimeout(this.eventQueueTimer)
        this.eventQueue.push(event)
        this.eventQueueTimer = setTimeout(() => {
          this.processEventQueue().then()
        }, 50)
      } else {
        this.eventQueueBuffer.push(event)
      }

      this.nameCache[cacheKey] = 1
    }
  }
  async processEventQueue() {
    this.eventQueueFlag = false

    const profileUpdates: Profile[] = this.eventQueue
      .filter((x) => x.kind === Kind.Metadata)
      .map((ev) => {
        const content = Raven.parseJson(ev.content)
        if (!content) return null
        return {
          id: ev.id,
          creator: ev.pubkey,
          created: ev.created_at,
          ...Raven.normalizeMetadata(content),
          nip05: content.nip05,
        }
      })
      .filter(notEmpty)
    if (profileUpdates.length > 0) {
      this.emit(RavenEvents.ProfileUpdate, profileUpdates)
    }

    const channelCreations: Channel[] = this.eventQueue
      .filter((x) => x.kind === Kind.ChannelCreation)
      .map((ev) => {
        const content = Raven.parseJson(ev.content)
        return content
          ? {
              id: ev.id,
              creator: ev.pubkey,
              created: ev.created_at,
              ...Raven.normalizeMetadata(content),
            }
          : null
      })
      .filter(notEmpty)
    if (channelCreations.length > 0) {
      this.emit(RavenEvents.ChannelCreation, channelCreations)
    }

    const channelUpdates: ChannelUpdate[] = this.eventQueue
      .filter((x) => x.kind === Kind.ChannelMetadata)
      .map((ev) => {
        const content = Raven.parseJson(ev.content)
        const channelId = Raven.findTagValue(ev, "e")
        if (!channelId) return null
        return content
          ? {
              id: ev.id,
              creator: ev.pubkey,
              created: ev.created_at,
              channelId,
              ...Raven.normalizeMetadata(content),
            }
          : null
      })
      .filter(notEmpty)
    if (channelUpdates.length > 0) {
      this.emit(RavenEvents.ChannelUpdate, channelUpdates)
    }

    const deletions: EventDeletion[] = this.eventQueue
      .filter((x) => x.kind === Kind.EventDeletion)
      .map((ev) => {
        const eventId = Raven.findTagValue(ev, "e")
        if (!eventId) return null
        return {
          eventId,
          why: ev.content || "",
        }
      })
      .filter(notEmpty)
      .flat()
    if (deletions.length > 0) {
      this.emit(RavenEvents.EventDeletion, deletions)
    }

    const publicMessages: PublicMessage[] = this.eventQueue
      .filter((x) => x.kind === Kind.ChannelMessage)
      .map((ev) => {
        const root = Raven.findNip10MarkerValue(ev, "root")
        const mentions = Raven.filterTagValue(ev, "p")
          .map((x) => x?.[1])
          .filter(notEmpty)
        if (!root) return null
        return ev.content
          ? {
              id: ev.id,
              root,
              content: ev.content,
              creator: ev.pubkey,
              mentions: uniq(mentions),
              created: ev.created_at,
            }
          : null
      })
      .filter(notEmpty)
    if (publicMessages.length > 0) {
      this.emit(RavenEvents.PublicMessage, publicMessages)
    }

    Promise.all(
      this.eventQueue
        .filter((x) => x.kind === Kind.EncryptedDirectMessage)
        .map((ev) => {
          const receiver = Raven.findTagValue(ev, "p")
          if (!receiver) return null
          const root = Raven.findNip10MarkerValue(ev, "root")
          const mentions = Raven.filterTagValue(ev, "p")
            .map((x) => x?.[1])
            .filter(notEmpty)

          const peer = receiver === this.pub ? ev.pubkey : receiver
          const msg = {
            id: ev.id,
            root,
            content: ev.content,
            peer,
            creator: ev.pubkey,
            mentions: uniq(mentions),
            created: ev.created_at,
            decrypted: false,
          }

          if (this.isSyntheticPrivKey()) {
            return msg
          }

          return nip04.decrypt(this.priv, peer, ev.content).then((content) => {
            return {
              ...msg,
              content,
              decrypted: true,
            }
          })
        })
        .filter(notEmpty)
    ).then((directMessages: DirectMessage[]) => {
      this.emit(RavenEvents.DirectMessage, directMessages)
    })

    const channelMessageHides: ChannelMessageHide[] = this.eventQueue
      .filter((x) => x.kind === Kind.ChannelHideMessage)
      .map((ev) => {
        const content = Raven.parseJson(ev.content)
        const id = Raven.findTagValue(ev, "e")
        if (!id) return null
        return {
          id,
          reason: content?.reason || "",
        }
      })
      .filter(notEmpty)
    if (channelMessageHides.length > 0) {
      this.emit(RavenEvents.ChannelMessageHide, channelMessageHides)
    }

    const channelUserMutes: ChannelUserMute[] = this.eventQueue
      .filter((x) => x.kind === Kind.ChannelMuteUser)
      .map((ev) => {
        const content = Raven.parseJson(ev.content)
        const pubkey = Raven.findTagValue(ev, "p")
        if (!pubkey) return null
        return {
          pubkey,
          reason: content?.reason || "",
        }
      })
      .filter(notEmpty)
    if (channelUserMutes.length > 0) {
      this.emit(RavenEvents.ChannelUserMute, channelUserMutes)
    }

    const muteListEv = this.eventQueue
      .filter((x) => x.kind.toString() === NewKinds.MuteList.toString())
      .sort((a, b) => b.created_at - a.created_at)[0]

    if (muteListEv) {
      const visiblePubkeys = Raven.filterTagValue(muteListEv, "p").map(
        (x) => x?.[1]
      )

      if (muteListEv.content !== "" && !this.isSyntheticPrivKey()) {
        nip04
          .decrypt(this.priv, this.pub, muteListEv.content)
          .then((e) => JSON.parse(e))
          .then((resp) => {
            const allPubkeys = [
              ...visiblePubkeys,
              ...resp.map((x: any) => x?.[1]),
            ]
            this.emit(RavenEvents.MuteList, {
              pubkeys: uniq(allPubkeys),
              encrypted: "",
            })
          })
      } else {
        this.emit(RavenEvents.MuteList, {
          pubkeys: visiblePubkeys,
          encrypted: muteListEv.content.trim(),
        })
      }
    }

    const leftChannelListEv = this.eventQueue
      .filter(
        (x) =>
          x.kind.toString() === NewKinds.Arbitrary.toString() &&
          Raven.findTagValue(x, "d") === "left-channel-list"
      )
      .sort((a, b) => b.created_at - a.created_at)[0]

    if (leftChannelListEv) {
      const content = Raven.parseJson(leftChannelListEv.content)
      if (Array.isArray(content) && content.every((x) => isSha256(x))) {
        this.emit(RavenEvents.LeftChannelList, content)
      }
    }

    const reactions: Reaction[] = this.eventQueue
      .filter((x) => x.kind === Kind.Reaction)
      .map((ev) => {
        const message = Raven.findNip10MarkerValue(ev, "root")
        const peer = Raven.findTagValue(ev, "p")
        if (!message || !peer || !ev.content) return null
        return {
          id: ev.id,
          message,
          peer,
          content: ev.content,
          creator: ev.pubkey,
          created: ev.created_at,
        }
      })
      .filter(notEmpty)
    if (reactions.length > 0) {
      this.emit(RavenEvents.Reaction, reactions)
    }

    const readMarkMapEv = this.eventQueue
      .filter(
        (x) =>
          x.kind.toString() === NewKinds.Arbitrary.toString() &&
          Raven.findTagValue(x, "d") === "read-mark-map"
      )
      .sort((a, b) => b.created_at - a.created_at)[0]

    if (readMarkMapEv) {
      const content = Raven.parseJson(readMarkMapEv.content)
      if (
        typeof content === "object" &&
        Object.keys(content).every((x) => isSha256(x))
      ) {
        this.emit(RavenEvents.ReadMarkMap, content)
      }
    }

    this.eventQueue = []
    this.eventQueueFlag = true
  }

  static normalizeMetadata(meta: Metadata) {
    return {
      name: meta.name || "",
      about: meta.about || "",
      picture: meta.picture || "",
    }
  }

  static parseJson(d: string) {
    try {
      return JSON.parse(d)
    } catch (e) {
      return null
    }
  }

  static findTagValue(ev: Event, tag: "e" | "p" | "d") {
    return ev.tags.find(([t]) => t === tag)?.[1]
  }

  static filterTagValue(ev: Event, tag: "e" | "p" | "d") {
    return ev.tags.filter(([t]) => t === tag)
  }

  static findNip10MarkerValue(ev: Event, marker: "reply" | "root" | "mention") {
    const eTags = Raven.filterTagValue(ev, "e")
    return eTags.find((x) => x[3] === marker)?.[1]
  }
}

export default Raven

export const initRaven = (): Raven | undefined => {
  let keys: Keys = {
    priv: "nsec1kh58dd68plvmx4wqflgfrfndl47z5gva4wx69ld7w2vpd3uq8exshqkczs",
    pub: "npub190qv6an5relukw6xjfdzkdywk8y2qwenc5qdnsajl4zkuly46acsd6py0t",
  }
  if (window.raven) {
    window.raven = undefined
  }

  if (keys) {
    window.raven = new Raven(keys.priv, keys.pub)
  }

  return window.raven
}
