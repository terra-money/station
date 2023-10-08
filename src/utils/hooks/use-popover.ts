import { useAtom } from "jotai"
import { popoverAtom } from "utils/nostr/atoms"

export type Popover = {
  body: JSX.Element
  anchorEl: HTMLElement
  toRight?: boolean
  toBottom?: boolean
  onClose?: () => void
} | null

const usePopover = (): [Popover, (popover: Popover) => void] => {
  const [popover, setPopover] = useAtom(popoverAtom)

  const showPopover = (popover: Popover) => {
    setPopover(popover)
  }

  return [popover as Popover, showPopover]
}

export default usePopover
