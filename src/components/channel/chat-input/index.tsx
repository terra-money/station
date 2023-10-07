import { useEffect, useRef } from "react"
import Box from "@mui/material/Box"
import { useTheme } from "@mui/material/styles"
import { lighten } from "@mui/material"
import { Button } from "components/general"
import Tools from "./tools"
import useMakeEditor from "./editor"
import { EditorContent, JSONContent } from "@tiptap/react"
import {
  getEditorValue,
  removeEditorValue,
  storeEditorValue,
} from "utils/localStorage/nostr"
import { Send } from "@mui/icons-material"
import styles from "./ChatInput.module.scss"

const ChatInput = (props: {
  senderFn: (message: string, mentions: string[]) => Promise<any>
}) => {
  const { senderFn } = props
  const inputRef = useRef<HTMLDivElement | null>(null)
  const storageKey = "chat-input"

  const save = () => {
    const val = editor?.getHTML()
    if (!val) {
      removeEditorValue(storageKey)
      return
    }
    storeEditorValue(storageKey, val)
  }

  const editor = useMakeEditor({
    content: getEditorValue(storageKey) || "",
    onUpdate: save,
  })

  useEffect(() => {
    editor?.commands.setContent(getEditorValue(storageKey) || "")
    editor?.commands.focus()
  }, [storageKey])

  function getMentions(data: JSONContent): string[] {
    const mentions = (data.content || []).flatMap(getMentions)
    if (data.type === "mention" && data.attrs?.id) {
      mentions.push(data.attrs.id)
    }
    return [...new Set(mentions)]
  }

  const send = () => {
    const message = editor?.getText()
    if (!message) return
    const json = editor?.getJSON()
    const mentions = json ? getMentions(json) : []
    editor?.commands.setContent("")
    removeEditorValue(storageKey)
    return senderFn(message, mentions)
  }

  const insert = (text: string) => {
    editor?.commands.insertContent(text)
    editor?.commands.focus()
  }

  return (
    <Box className={styles.ChatInputWrapper}>
      <Box>
        <Box className={styles.ChatInput}>
          <EditorContent
            editor={editor}
            onKeyDown={(e) => {
              if (!e.shiftKey && e.key === "Enter") {
                send()
              }
            }}
          />
        </Box>
        <Box className={styles.ChatActions}>
          <Box className={styles.ToolsWrapper}>
            <Tools
              inputRef={inputRef}
              senderFn={(message: string) => {
                return props.senderFn(message, [])
              }}
              insertFn={insert}
            />
          </Box>
          <Button className={styles.SendButton} color="primary" onClick={send}>
            <Send height={32} />
          </Button>
        </Box>
      </Box>
    </Box>
  )
}

export default ChatInput
