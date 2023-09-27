import React, { useState } from "react"
import GifPicker from "./gif-picker"
import usePopover from "utils/hooks/use-popover"
import { GifBox } from "@mui/icons-material"
import { Button } from "components/general"

const Gif = (props: { onSelect: (selected: string) => void }) => {
  const [, showPopover] = usePopover()
  const [hover, setHover] = useState<boolean>(false)

  const gifClicked = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    setHover(true)
    showPopover({
      body: (
        <GifPicker
          onSelect={(gif) => {
            setTimeout(() => {
              props.onSelect(gif)
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
    <Button onClick={gifClicked} color="default">
      <GifBox height={20} />
    </Button>
  )
}

export default Gif
