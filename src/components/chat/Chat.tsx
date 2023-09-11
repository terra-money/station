import { useAuth } from "auth"
import { Event, Kind } from "data/nostr/event"
import { relayInit } from "data/nostr/relay"
import { useEffect, useState } from "react"

export const Chat = () => {
  const { getConnectedWallet } = useAuth()
  const [relay, setRelay] = useState(relayInit("ws://loclahost:7447"))
  const [pubStatus, setPubStatus] = useState("")
  const [newEvent, setNewEvent] = useState<Event<any>>()
  const [events, setEvents] = useState<Event<any>[]>([])

  useEffect(() => {
    const connectRelay = async () => {
      await relay.connect()

      relay.on("connect", () => {
        setRelay(relay)
      })
      relay.on("error", () => {
        console.log("failed to connect")
      })
    }

    connectRelay()
  })

  const publishEvent = (event: any) => {
    console.log(event)
    //  const pub =
    relay.publish(event)

    // pub.on("ok", () =>{
    //   setPubStatus("our event is published");
    // })
    // pub.on("failed", reason => {
    //   setPubStatus(`failed to publish message ${reason}`)
    // })
  }

  const getEvent = async () => {
    var sub = relay.sub([
      {
        kinds: [
          Kind.ChannelCreation,
          Kind.ChannelMetadata,
          Kind.ChannelMessage,
          Kind.ChannelHideMessage,
          Kind.ChannelMuteUser,
        ],
      },
    ])
    sub.on("event", (event) => {
      setNewEvent(event)
    })
  }

  const getEvents = async () => {
    var events = await relay.list([
      {
        kinds: [
          Kind.ChannelCreation,
          Kind.ChannelMetadata,
          Kind.ChannelMessage,
          Kind.ChannelHideMessage,
          Kind.ChannelMuteUser,
        ],
      },
    ])
    setEvents(events)
  }

  return (
    <div>
      {relay ? (
        <p>Connected to {relay.url}</p>
      ) : (
        <p>Could not connect to relay</p>
      )}
      <p>Publish status: {pubStatus}</p>
      <button onClick={() => getEvent()}>subscribe event</button>
      {newEvent ? (
        <p>Subscribed event content: {newEvent.content}</p>
      ) : (
        <p>no new event</p>
      )}
      <button onClick={() => getEvents()}>load feedt</button>
      {events !== null &&
        events.map((event) => (
          <p key={event.sig} style={{ borderStyle: "ridge", padding: 10 }}>
            {event.content}
          </p>
        ))}
    </div>
  )
}
