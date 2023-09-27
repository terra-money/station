import React, { useState } from "react"
import { Button } from "components/general"
import EmojiPicker from "./emoji-picker"
import usePopover from "utils/hooks/use-popover"
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt"

const Emoji = (props: { onSelect: (selected: string) => void }) => {
  const [, showPopover] = usePopover()
  const [hover, setHover] = useState<boolean>(false)

  const emojiClicked = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    setHover(true)
    showPopover({
      body: (
        <EmojiPicker
          onSelect={(emoji) => {
            setTimeout(() => {
              props.onSelect(emoji)
            }, 200)
            showPopover(null)
            setHover(false)
          }}
        />
      ),
      anchorEl: event.currentTarget,
      onClose: () => {
        setHover(false)
      },
    })
  }

  return (
    <Button onClick={emojiClicked} color="default">
      <SentimentSatisfiedAltIcon height={20} />
    </Button>
  )
}

export default Emoji
