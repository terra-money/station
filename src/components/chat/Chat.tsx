import { Event, Kind, relayInit } from "nostr-tools"
import { useEffect, useState } from "react"

export const Chat = () => {
  const [relay, setRelay] = useState(relayInit("ws://localhost:7447"))
  const [pubStatus, setPubStatus] = useState("")
  const [newEvent, setNewEvent] = useState<Event>()
  const [events, setEvents] = useState<Event[]>([])

  useEffect(() => {
    const connectRelay = async () => {
      await relay.connect()

      relay.on("connect", () => {
        setRelay(relay)
        getEvent()
      })
      relay.on("error", () => {
        console.log("failed to connect")
      })
    }

    connectRelay()
  }, [])

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
    let sub = relay.sub([
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
    sub.on("event", (event: any) => {
      console.log(event)
      setNewEvent(event)
    })
  }

  return <div></div>
}
