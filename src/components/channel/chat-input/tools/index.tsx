import { MutableRefObject, useEffect } from "react"
import Emoji from "./emoji"
import Gif from "./gif"
import styles from "./Tools.module.scss"

const Tools = (props: {
  inputRef: MutableRefObject<HTMLDivElement | null>
  insertFn: (text: string) => void
  senderFn: (message: string) => void
}) => {
  const { inputRef, insertFn, senderFn } = props

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      e.preventDefault()
      insertFn(e.clipboardData!.getData("text/plain"))
    }

    const onDrop = (e: DragEvent) => {
      e.preventDefault()
    }

    const input = inputRef.current

    input?.addEventListener("paste", onPaste)
    input?.addEventListener("drop", onDrop)
    return () => {
      input?.removeEventListener("paste", onPaste)
      input?.removeEventListener("drop", onDrop)
    }
  }, [])

  return (
    <div className={styles.ToolsWrapper}>
      <Emoji onSelect={insertFn} />
      <Gif onSelect={senderFn} />
    </div>
  )
}

export default Tools
