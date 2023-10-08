import { useState } from "react"
import { useAtom } from "jotai"
import Box from "@mui/material/Box"
import { Message, ReactionCombined } from "types/nostr"
import { ravenAtom } from "utils/nostr/atoms"
import styles from "./MessageReactions.module.scss"
import { Button } from "components/general"

const ReactionBtn = (props: { message: Message; r: ReactionCombined }) => {
  const { message, r } = props
  const [raven] = useAtom(ravenAtom)
  const [inProgress, setInProgress] = useState(false)

  return (
    <Button
      key={r.symbol}
      style={{ backgroundColor: r.userReaction !== undefined ? "#fff" : "" }}
      className={styles.ReactionButton}
      onClick={() => {
        if (inProgress) return
        setInProgress(true)
        ;(r.userReaction
          ? raven?.deleteEvents([r.userReaction.id])
          : raven?.sendReaction(message.id, message.creator, r.symbol)
        )?.finally(() => {
          setInProgress(false)
        })
      }}
    >
      <Box className={styles.ReactionEmoji}>{r.symbol}</Box>
      <Box className={styles.ReactionCount}>{r.count}</Box>
    </Button>
  )
}

export default ReactionBtn
