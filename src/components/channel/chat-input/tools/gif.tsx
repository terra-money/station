import React, { useState } from "react"
import Box from "@mui/material/Box"
import GifPicker from "./gif-picker"
import usePopover from "utils/hooks/use-popover"
import { GifBox } from "@mui/icons-material"

const Gif = (props: { onSelect: (selected: string) => void }) => {
  const [, showPopover] = usePopover()
  const [hover, setHover] = useState<boolean>(false)

  const gifClicked = (event: React.MouseEvent<HTMLDivElement>) => {
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
    <Box onClick={gifClicked} className={hover ? "hover" : ""}>
      <GifBox height={20} />
    </Box>
  )
}

export default Gif
