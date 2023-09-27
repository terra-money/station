import React from "react"
import Popover from "@mui/material/Popover"
import usePopover from "utils/hooks/use-popover"

const PopoverProvider = (props: { children: React.ReactNode }) => {
  const [popover, setPopover] = usePopover()

  const hide = () => {
    setPopover(null)
    popover?.onClose?.()
  }

  return (
    <>
      {props.children}
      {popover && (
        <Popover
          className="CommunityPopover"
          transitionDuration={0}
          open={true}
          anchorEl={popover.anchorEl}
          onClose={hide}
          anchorOrigin={{
            vertical: popover.toBottom ? "bottom" : "top",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: popover.toRight ? "right" : "left",
          }}
          PaperProps={{
            sx: {
              backgroundColor: "transparent",
            },
          }}
          sx={{ ml: "10px" }}
        >
          {popover.body}
        </Popover>
      )}
    </>
  )
}

export default PopoverProvider
